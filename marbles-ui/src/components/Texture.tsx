import dynamic from 'next/dynamic'
import React from 'react'

const Sketch = dynamic(() => import('react-p5'), { ssr: false })

let x = 50
let y = 50

export const Texture = () => {
    const [canRender, setCanRender] = React.useState(false)

    React.useEffect(() => {
        setCanRender(true)
    }, [setCanRender])

    const setup = React.useCallback((p5, parent) => {
        p5.createCanvas(500, 500).parent(parent)
    }, [])

    const draw = React.useCallback((p5) => {
        p5.background(100)
        console.log('once please')
        p5.noLoop()
    }, [])

    return canRender ? <Sketch setup={setup} draw={draw} /> : null
}
