import React from 'react'
import type { NextPage } from 'next'
import { View } from '~/render/marble'
import { Texture } from '~/components/Texture'

const Marble: NextPage = () => {
    const [textureUri, setTextureUri] = React.useState<string | null>(null)
    const [marbleCanvas, setMarbleCanvas] =
        React.useState<HTMLCanvasElement | null>(null)
    const viewRef = React.useCallback(
        async (canvas: HTMLCanvasElement) => {
            if (canvas != null) {
                setMarbleCanvas(canvas)
            }
        },
        [setMarbleCanvas]
    )

    const handleTextureRender = React.useCallback(
        (canvas: HTMLCanvasElement) => {
            setTextureUri(canvas.toDataURL('image/png'))
        },
        [setTextureUri]
    )

    React.useEffect(() => {
        const createView = async (canvas: HTMLCanvasElement, uri: string) => {
            const view = await View.create(canvas, uri)
            console.log(view)
            await view.render()
        }

        if (marbleCanvas && textureUri) {
            createView(marbleCanvas, textureUri)
        }
    }, [marbleCanvas, textureUri])

    return (
        <div>
            <Texture onTextureRender={handleTextureRender} />
            <canvas ref={viewRef} />
        </div>
    )
}

export default Marble
