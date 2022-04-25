import type { NextPage } from 'next'

import THREE from 'three';
import React from 'react';
import { View } from '~/render/terrain';
import { Texture } from '~/components/Texture'

const Game: NextPage = () => {
    const viewRef = React.useCallback(async (canvas: HTMLCanvasElement) => {
        if (canvas != null) {
            const view = await View.create(canvas);
            await view.render()
        }
    }, [])
    // @ts-ignore
    const handleClick = (event) => {
        console.log(event.clientX);
        console.log(event.clientY);
    }

    return (
        <div>
            <canvas ref={viewRef} onClick={ handleClick }/>
        </div>
    )
}

export default Game
