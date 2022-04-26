import { starknet } from 'hardhat'
import { assert, expect } from 'chai'
import { Contract, ContractFactory, Transaction } from 'ethers'
import { StarknetContract, StarknetContractFactory, ArgentAccount } from "hardhat/types/runtime";


describe('ChainlinkTests', function () {
    this.timeout(600_000);
    let account: ArgentAccount;
    let account2: ArgentAccount;
    let account3: ArgentAccount;
    let ERC721: StarknetContractFactory;
    let ERC721Contract: StarknetContract;
    let mainContract: StarknetContract;
    before(async () => {
        account = (await starknet.deployAccount("Argent")) as ArgentAccount;
        account2 = (await starknet.deployAccount("Argent")) as ArgentAccount;
        account3 = (await starknet.deployAccount("Argent")) as ArgentAccount;
        let mainContractFactory = await starknet.getContractFactory('contracts/game/gameLogic.cairo')
        mainContract = await mainContractFactory.deploy({ owner: account.starknetContract.address })
        ERC721 = await starknet.getContractFactory('contracts/ERC721/ERC721_Mintable_Burnable_LongTokenURI.cairo')
        console.log(starknet.shortStringToBigInt("MARBLENFT"))
        ERC721Contract = await ERC721.deploy({name: starknet.shortStringToBigInt("Marble"), symbol: starknet.shortStringToBigInt("MARBLENFT"), owner: mainContract.address })
    });

    it('Test', async () => {
       console.log(ERC721Contract.address)
        await account.invoke(mainContract, 'set_token_address', { token_add: ERC721Contract.address})
        {
            await account2.invoke(mainContract, 'mint_marble', { tokenURI : [starknet.shortStringToBigInt("bafkreierzdc5kkrbxmkooj2wt2jx4p"), starknet.shortStringToBigInt("ebvne5nko4qzowpurj5hr7l4kv7u")] })

            const { balance: balance1 } = await ERC721Contract.call('balanceOf', { owner: account2.starknetContract.address })
            console.log(balance1)
        }
        {
            await account3.invoke(mainContract, 'mint_marble', { tokenURI : [starknet.shortStringToBigInt("bafkreieoedc5kkrbxmkooj2wt2jx4p"), starknet.shortStringToBigInt("ebvne5nko4qzowpurj9Lr7l4kv7u")] })

            const { balance: balance2 } = await ERC721Contract.call('balanceOf', { owner: account3.starknetContract.address })
            console.log(balance2)
        }
        await account2.invoke(ERC721Contract, 'approve', { to: mainContract.address, tokenId: { low: 1, high: 0 } })

        await account3.invoke(ERC721Contract, 'approve', { to: mainContract.address, tokenId: { low: 2, high: 0 } })

        // const { res: res } = await mainContract.call('game_start', { player_add: account2.starknetContract.address, tokenID: { low: 1, high: 0 }, gameID: 1 })
        // console.log(res)
        await account.invoke(mainContract, 'game_start', { player_add: account2.starknetContract.address, tokenID: { low: 1, high: 0 }, gameID: 1 })

        await account.invoke(mainContract, 'game_start', { player_add: account3.starknetContract.address, tokenID: { low: 2, high: 0 }, gameID: 1 })

        const { balance: balance1 } = await ERC721Contract.call('balanceOf', { owner: account2.starknetContract.address })
        console.log(balance1)
        const { balance: balance2 } = await ERC721Contract.call('balanceOf', { owner: account3.starknetContract.address })
        console.log(balance2)

        const { balance: balance4 } = await ERC721Contract.call('balanceOf', { owner: mainContract.address })
        console.log(balance4)

        // await account2.invoke(ERC721Contract, 'approve', { to: mainContract.address, tokenId: { low: 1, high: 0 } })
        // await ERC721Contract.call('approve', { to: mainContract.address, tokenId: { low: 1, high: 0 } })

        await account.invoke(mainContract, 'game_end', { gameID: 1, winner_add: account2.starknetContract.address })

        const { balance: balance3 } = await ERC721Contract.call('balanceOf', { owner: account2.starknetContract.address })
        console.log(balance3)

    });
});
