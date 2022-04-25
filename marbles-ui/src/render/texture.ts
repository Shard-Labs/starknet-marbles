/**
 * Generate P5 textures
 */

import P5 from 'p5'
import 'p5/lib/addons/p5.dom'

export function createSketch(parent: HTMLElement) {
    return new P5((p5: P5) => {
        p5.setup = () => {
            const canvas = p5.createCanvas(200, 200)
            canvas.parent(parent)

            p5.background('red')
        }
    })
}
