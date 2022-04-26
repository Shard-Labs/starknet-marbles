import * as THREE from 'three'
import { createScene } from '~/render/scene';
import { createCamera } from '~/render/camera';
import { renderTerrain } from '~/render/terrain';
import { WIDTH, DEPTH, MIN_HEIGHT, MAX_HEIGHT } from '~/lib/constants'

async function createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    return renderer
}


export class View {
    private constructor(
        private renderer: THREE.WebGLRenderer,
        private scene: THREE.Scene,
        private camera: THREE.Camera,
    ) {}

    static async create(canvas: HTMLCanvasElement): Promise<View> {
        return new View(
            await createRenderer(canvas),
            await createScene(),
            createCamera(WIDTH, DEPTH,  MIN_HEIGHT, MAX_HEIGHT)
        )
    }

    public async addTerrain() {
        this.scene.add(await renderTerrain());
    }

    public async render() {
        this.renderer.render(this.scene, this.camera)
    }
}
