import React from 'react'
import type { NextPage } from 'next'
import { View } from '~/render/marble'
import { Texture } from '~/components/Texture'

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
            <canvas ref={viewRef} />
            <Texture />
        </div>
    )
}

export default Marble
