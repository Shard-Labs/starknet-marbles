import React, { useMemo } from 'react'
import type { NextPage } from 'next'
import { View } from '~/render/marble'
import { Texture } from '~/components/Texture'
import { useRouter } from 'next/router'
import { useImage } from '~/providers/FirebaseProvider'

const btnStyles = {
    padding: '.5rem',
    fontSize: '1.5rem',
    fontFamily: 'monospace',
    appearance: 'none',
    background: 'black',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
} as any

const Marble: NextPage = () => {
    const router = useRouter()
    const imageId = useMemo(() => {
        return parseInt(router.query.id as string)
    }, [router])

    const { upload, download, uploaded } = useImage(imageId)

    const [textureUri, setTextureUri] = React.useState<string | null>(null)
    const [marbleCanvas, setMarbleCanvas] =
        React.useState<HTMLCanvasElement | null>(null)
    const [textureCanvas, setTextureCanvas] =
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
            setTextureCanvas(canvas)
        },
        [setTextureUri]
    )

    React.useEffect(() => {
        let view: View

        const createView = async (canvas: HTMLCanvasElement, uri: string) => {
            view = await View.create(canvas, uri)
            view.animate()
        }

        if (marbleCanvas && textureUri) {
            createView(marbleCanvas, textureUri)
        }
    }, [marbleCanvas, textureUri])

    const handleUpload = React.useCallback(() => {
        if (!textureUri) {
            return
        }

        textureCanvas?.toBlob((blob) => {
            if (blob) {
                console.log(blob)
                upload(blob)?.catch((err) => alert(err))
            }
        }, 'image/png')
    }, [upload, textureCanvas])

    const handleDownload = React.useCallback(() => {
        download()
            ?.then((uri) => {
                console.log(uri)
            })
            .catch((err) => alert(err))
    }, [download])

    return (
        <div style={{ backgroundColor: 'black' }}>
            {uploaded !== undefined && (
                <>
                    {!uploaded && (
                        <button style={btnStyles} onClick={handleUpload}>
                            upload
                        </button>
                    )}
                    {uploaded && (
                        <button style={btnStyles} onClick={handleDownload}>
                            download
                        </button>
                    )}
                </>
            )}

            <Texture
                key={imageId}
                hashNumber={imageId}
                onTextureRender={handleTextureRender}
            />
            <canvas style={{ overflow: 'hidden' }} ref={viewCanvasRef} />
        </div>
    )
}

export default Marble
