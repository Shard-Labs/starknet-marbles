# SPDX-License-Identifier: MIT
# OpenZeppelin Cairo Contracts v0.1.0 (token/erc721/ERC721_Mintable_Burnable.cairo)

%lang starknet

from starkware.cairo.common.cairo_builtins import BitwiseBuiltin, HashBuiltin, SignatureBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_eq, uint256_add
from starkware.cairo.common.math import assert_not_zero, assert_lt, assert_le, assert_not_equal
from starkware.starknet.common.syscalls import get_contract_address, get_caller_address
from starkware.cairo.common.alloc import alloc
from contracts.utils.constants import TRUE, FALSE
from contracts.erc721.library import (
    ERC721_name,
    ERC721_symbol,
    ERC721_balanceOf,
    ERC721_ownerOf,
    ERC721_getApproved,
    ERC721_isApprovedForAll,

    ERC721_initializer,
    ERC721_approve,
    ERC721_setApprovalForAll,
    ERC721_transferFrom,
    ERC721_safeTransferFrom,
    ERC721_mint,
    ERC721_burn,
    ERC721_only_token_owner,
)
# from openzeppelin.utils.String import (
#     String_set,
#     String_get,
# )

from contracts.introspection.ERC165 import ERC165_supports_interface

from contracts.access.ownable import (
    Ownable_initializer,
    Ownable_only_owner
)

@contract_interface
namespace IERC721:
    func transferFrom(_from: felt, to: felt, tokenId: Uint256):
    end

    func approve(to: felt, tokenId: Uint256):
    end

    func mint(to: felt, tokenId: Uint256, tokenURI_len: felt, tokenURI: felt*):
    end
end

struct GameTokens:
    member tokenID_1 : Uint256
    member tokenID_2 : Uint256
end

@storage_var
func s_token_add() -> (address : felt):
end

@storage_var
func s_token_per_Game(id : felt) -> (gameTokens : GameTokens):
end

@storage_var
func s_marbleID() -> (id : Uint256):
end

#
# Constructor
#

@constructor
func constructor{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        owner: felt
    ):
    Ownable_initializer(owner)
    return ()
end

@external
func set_token_address{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(token_add: felt):
    Ownable_only_owner()
    s_token_add.write(token_add)
    return ()
end

#
# Getters
#
@external
func game_start{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(player_add: felt, tokenID: Uint256, gameID: felt):
    let (token_add) = s_token_add.read()
    let (address) = get_contract_address()

    IERC721.transferFrom(token_add, player_add, address, tokenID)

    check_start_transfert(gameID, tokenID)

    return ()
end


@external
func check_start_transfert{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(gameID: felt, tokenID: Uint256):
    alloc_locals
    let (local gameTokens : GameTokens) = s_token_per_Game.read(gameID)

    let (yesno) = uint256_eq(gameTokens.tokenID_1, Uint256(0, 0))
    if yesno == TRUE:
        s_token_per_Game.write(gameID, GameTokens(tokenID, gameTokens.tokenID_2))
    else:
        with_attr error_message("TokenID already existe"):
            assert gameTokens.tokenID_2 = Uint256(0, 0)
        end
        s_token_per_Game.write(gameID, GameTokens(gameTokens.tokenID_1, tokenID))
    end
    return()
end

@external
func game_end{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(gameID: felt, winner_add: felt):
    alloc_locals
    Ownable_only_owner()
    let ( gameTokens : GameTokens) = s_token_per_Game.read(gameID)
    let (id_array: Uint256*) = alloc()
    assert id_array[0] = gameTokens.tokenID_1
    assert id_array[1] = gameTokens.tokenID_2
    check_token_id(id_array_len=2, id_array=id_array)
    transfer_marble(id_array_len=2, id_array=id_array, winner_add=winner_add) 
    return ()
end

func check_token_id{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(id_array_len: felt, id_array: Uint256*):
    alloc_locals
    if id_array_len == 0:
        return ()
    end

    let (local yesno) = uint256_eq([id_array], Uint256(0,0))
    with_attr error_message("TokenID can not be 0"):
        assert yesno = FALSE
    end

    return check_token_id(id_array_len=id_array_len - 1, id_array=id_array + 1)
end

func transfer_marble{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(id_array_len: felt, id_array: Uint256*, winner_add: felt):
    if id_array_len == 0:
        return ()
    end
    let (owner) = get_contract_address()
    let (token_add) = s_token_add.read()
    IERC721.approve(token_add, winner_add, [id_array])
    IERC721.transferFrom(token_add, owner, winner_add, [id_array])

    return transfer_marble(id_array_len=id_array_len - 1, id_array=id_array + Uint256.SIZE, winner_add=winner_add)
end


#
# MINT NFT MARBLES
#
@external
func mint_marble{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tokenURI_len: felt, tokenURI: felt*):

    alloc_locals
    let (local sender) = get_caller_address()
    let (tokenID : Uint256) = s_marbleID.read()
    let (new_tokenID : Uint256, add_carry) = uint256_add(tokenID, Uint256(1, 0))
    assert add_carry = 0
    let (address) = s_token_add.read()
    IERC721.mint(address, sender, new_tokenID, tokenURI_len, tokenURI)

    s_marbleID.write(new_tokenID)

    return ()
end

