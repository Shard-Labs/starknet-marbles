import React from 'react'
import type { NextPage } from 'next'
import { View } from '../render/marble'

const Marble: NextPage = () => {
    const viewRef = React.useCallback(async (canvas: HTMLCanvasElement) => {
        if (canvas != null) {
            const view = await View.create(canvas)
            console.log(view)
            await view.render()
        }
    }, [])

    return (
        <div>
            <canvas ref={viewRef}></canvas>
        </div>
    )
}

export default Marble
