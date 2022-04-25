import dynamic from 'next/dynamic'
import React from 'react'

const Sketch = dynamic(() => import('react-p5'), { ssr: false })

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
    defaultColor: string
}

const rarityData: Record<Rarity, RarityDatum> = {
    [Rarity.BASIC]: {
        width: 300,
        colors: [255, 255, 255],
        defaultColor: 'white',
    },
    [Rarity.RARE]: {
        width: 400,
        colors: [255, 255, 0],
        defaultColor: 'azure',
    },
    [Rarity.EPIC]: {
        width: 500,
        colors: [255, 125, 0],
        defaultColor: 'gold',
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
            const { canvas } = p5.createCanvas(width, width / 2).parent(parent)
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
            // p5.blendMode(p5.LIGHTEST)

            const rez = 0.015
            const t = hashNumber

            const colorA = p5.color(rarityData[rarity].defaultColor)
            const colorB = p5.color(...p5.shuffle(rarityData[rarity].colors))

            p5.translate(p5.width / 2, p5.height / 2)

            for (let i = p5.width * 2 + 50; i > 0; i -= 1) {
                var n1 = p5.noise(i * rez, i * rez, t)
                var n2 = p5.noise(i * rez - t, i * rez, t)
                var n3 = p5.noise(i * rez + t, i * rez, t)

                const c = p5.lerpColor(
                    p5.color(
                        colorA.levels[0] * n1,
                        colorB.levels[1] * n2,
                        colorB.levels[2] * n3
                    ),
                    colorA,
                    p5.map(i, p5.width, 0, 0, 1)
                )

                p5.fill(c)

                p5.circle(0, 0, i)
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
