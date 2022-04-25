import React, { useMemo } from 'react'
import type { NextPage } from 'next'
import { View } from '~/render/marble'
import { Texture } from '~/components/Texture'
import { useRouter } from 'next/router'

const Marble: NextPage = () => {
    const router = useRouter()
    console.log(router.query)
    const hashNumber = useMemo(() => {
        return parseInt(router.query.id as string)
    }, [router])

    const [textureUri, setTextureUri] = React.useState<string | null>(null)
    const [marbleCanvas, setMarbleCanvas] =
        React.useState<HTMLCanvasElement | null>(null)
    const viewCanvasRef = React.useCallback(
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
        let view: View

        const createView = async (canvas: HTMLCanvasElement, uri: string) => {
            view = await View.create(canvas, uri)
            await view.render()
        }

        if (marbleCanvas && textureUri) {
            createView(marbleCanvas, textureUri)
        }

        window.addEventListener('mousemove', () => {
            if (view) {
                view.animate()
            }
        })
    }, [marbleCanvas, textureUri])

    const base64 = useMemo(() => {
        return textureUri?.split(';base64,')[1]
    }, [textureUri])

    return (
        <div>
            <Texture
                key={hashNumber}
                hashNumber={hashNumber}
                onTextureRender={handleTextureRender}
            />
            <canvas ref={viewCanvasRef} />
        </div>
    )
}

export default Marble
