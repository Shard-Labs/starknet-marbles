import dynamic from 'next/dynamic'
import React from 'react'

const Sketch = dynamic(() => import('react-p5'), { ssr: false })

let x = 50
let y = 50

interface TextureProps {
    onTextureRender: (canvas: HTMLCanvasElement) => void
    hashNumber: number
}

enum Rarity {
    BASIC,
    RARE,
    EPIC,
}

interface RarityDatum {
    width: number
    colors: Array<number>
}

const rarityData: Record<Rarity, RarityDatum> = {
    [Rarity.BASIC]: {
        width: 500,
        colors: [255, 10, 0],
    },
    [Rarity.RARE]: {
        width: 750,
        colors: [255, 125, 0],
    },
    [Rarity.EPIC]: {
        width: 1000,
        colors: [255, 255, 255],
    },
}

export const Texture: React.FC<TextureProps> = ({
    onTextureRender,
    hashNumber,
}) => {
    const [canRender, setCanRender] = React.useState(false)
    const [canvasEl, setCanvasEl] = React.useState<HTMLCanvasElement | null>(
        null
    )

    React.useEffect(() => {
        setCanRender(true)
    }, [setCanRender])

    const rarity = React.useMemo(() => {
        if (hashNumber % 5 == 0) {
            return Rarity.EPIC
        }

        if (hashNumber % 3 === 0) {
            return Rarity.RARE
        }

        return Rarity.BASIC
    }, [hashNumber])

    const setup = React.useCallback(
        (p5, parent) => {
            const width = rarityData[rarity].width
            const { canvas } = p5.createCanvas(width, width).parent(parent)
            setCanvasEl(canvas)
        },
        [setCanvasEl, rarity]
    )

    const draw = React.useCallback(
        (p5) => {
            p5.background(255)
            p5.noiseSeed(hashNumber)
            p5.randomSeed(hashNumber)
            p5.noStroke()

            const rez = 0.005
            const t = hashNumber

            const colorA = p5.color('white')
            const colorB = p5.color(...p5.shuffle(rarityData[rarity].colors))

            for (let i = 0; i < p5.height; i += 2) {
                for (let j = 0; j < p5.width; j += 2) {
                    var n1 = p5.noise(i * rez, j * rez, t)
                    var n2 = p5.noise(i * rez - t, j * rez, t)
                    var n3 = p5.noise(i * rez + t, j * rez, t)

                    const c = p5.lerpColor(
                        colorA,
                        p5.color(
                            colorB.levels[0] * n1,
                            colorB.levels[1] * n2,
                            colorB.levels[2] * n3
                        ),
                        p5.map(n1, -1, 1, 0, 1)
                    )

                    p5.fill(c)
                    p5.rect(i, j, 2)
                }
            }

            if (canvasEl != null) {
                onTextureRender(canvasEl)
            }

            p5.noLoop()
        },
        [canvasEl, onTextureRender, rarity]
    )

    return canRender ? (
        <div
            style={{
                visibility: 'hidden',
                height: 0,
            }}
        >
            <Sketch setup={setup} draw={draw} />
        </div>
    ) : null
}
