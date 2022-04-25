import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class Marble {
    private _geometry: THREE.BufferGeometry
    private _material: THREE.Material
    private _mesh: THREE.Mesh

    private constructor(
        private _radius: number,

        private _opacity: number,
        private _texture: THREE.Texture
    ) {
        this._geometry = new THREE.IcosahedronGeometry(this._radius, 15)
        this._material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: this._opacity,
            // roughness: 0.1,
            // transmission: 1,
            map: this._texture,
        })

        this._mesh = new THREE.Mesh(this._geometry, this._material)
    }

    static create(
        radius: number,

        opacity: number,
        texture: THREE.Texture
    ): Marble {
        return new Marble(
            radius,

            opacity,
            texture
        )
    }

    get mesh(): THREE.Mesh {
        return this._mesh
    }
}

async function getTexture(uri: string) {
    // load texture from url
    const texture = await new THREE.TextureLoader().loadAsync(uri)

    texture.mapping = THREE.EquirectangularReflectionMapping
    // texture.wrapS = THREE.MirroredRepeatWrapping
    // texture.wrapT = THREE.MirroredRepeatWrapping
    texture.encoding = THREE.sRGBEncoding

    return texture
}

async function renderMarble(textureUri: string) {
    const texture = await getTexture(textureUri)
    const marble = Marble.create(2, 1, texture)
    marble.mesh.position.set(0, 0, 0)
    marble.mesh.rotation.set(0, 0, 0)
    marble.mesh.scale.set(1, 1, 1)

    return marble.mesh
}

async function createScene(textureUri: string) {
    const scene = new THREE.Scene()

    scene.add(await renderMarble(textureUri))

    return scene
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.z = 5
    return camera
}

async function createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0xffffff, 1)

    return renderer
}

export class View {
    private controls: OrbitControls

    private constructor(
        private renderer: THREE.WebGLRenderer,
        private scene: THREE.Scene,
        private camera: THREE.Camera
    ) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }

    static async create(
        canvas: HTMLCanvasElement,
        textureUri: string
    ): Promise<View> {
        const renderer = await createRenderer(canvas)
        const scene = await createScene(textureUri)
        const camera = createCamera()

        renderer.render(scene, camera)

        return new View(
            await createRenderer(canvas),
            await createScene(textureUri),
            createCamera()
        )
    }

    public async render() {
        this.renderer.render(this.scene, this.camera)
    }

    public animate() {
        // requestAnimationFrame(this.animate)
        this.controls.update()
        this.render()
    }
}
