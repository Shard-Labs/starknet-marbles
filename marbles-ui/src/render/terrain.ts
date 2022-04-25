import * as THREE from 'three';

const terrainWidthExtents = 200;
const terrainDepthExtents = 200;
const terrainWidth = 228;
const terrainDepth = 228;
const terrainHalfWidth = terrainWidth / 2;
const terrainHalfDepth = terrainDepth / 2;
const terrainMaxHeight = 10;
const terrainMinHeight = - 2;
const heightData = generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );

class Terrain {
    private _geometry: THREE.BufferGeometry;
    private _material: THREE.Material;
    private _mesh: THREE.Mesh;

    private constructor(
        private _width: number,
        private _height: number,
        private _widthSegments: number,
        private _heightSegments: number,
        private _texture: any
    ) {
        this._geometry = new THREE.PlaneGeometry(terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1);
        this._geometry.rotateX( - Math.PI / 2 );

        const vertices = this._geometry.attributes.position.array;


        for ( let i = 0, j = 0, l = vertices.length ; i < l; i ++, j += 3 ) {

            // j + 1 because it is the y component that we modify
            // @ts-ignore
            vertices[ j + 1 ] = heightData[ i ];

        }

        this._geometry.computeVertexNormals();

        this._material = new THREE.MeshStandardMaterial(_texture)
        this._mesh = new THREE.Mesh( this._geometry, this._material );
        this._mesh.receiveShadow = true;
        this._mesh.castShadow = true;
    }

    static create(
         width: number,
         height: number,
         widthSegments: number,
         heightSegments: number,
         texture: any
    ): Terrain {
        return new Terrain(
            width,
            height,
            widthSegments,
            heightSegments,
            texture
        );
    }

    get mesh(): THREE.Mesh {
        return this._mesh
    }

}

async function getTexture() {
    const textureLoader = new THREE.TextureLoader();

    const soilBaseColor = await textureLoader.loadAsync("/Rock_Moss_001_basecolor.jpeg");
    const soilNormalMap = await textureLoader.loadAsync("/Rock_Moss_001_normal.jpeg");
    const soilHeightMap = await textureLoader.loadAsync("/Rock_Moss_001_height.png");
    const soilRoughness = await textureLoader.loadAsync("/Rock_Moss_001_roughness.jpeg");
    const soilAmbientOcclusion = await textureLoader.loadAsync("/Rock_Moss_001_ambientOcclusion.jpeg");

    return {
        map: soilBaseColor,
        normalMap: soilNormalMap,
        displacementMap: soilHeightMap,
        displacementScale: 2,
        roughnessMap: soilRoughness,
        roughness: 10,
        aoMap: soilAmbientOcclusion
    }
}

async function renderTerrain () {
    const texture = await getTexture();
    const terrain = Terrain.create(100, 100, 10, 10, texture);

    return terrain.mesh;
}

async function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    addAmbientLight(scene);
    addDirectLight(scene);
    scene.add(await renderTerrain())

    return scene;
}

function addAmbientLight(scene: THREE.Scene) {
    const light = new THREE.AmbientLight(0x101010);
    scene.add(light);
}

function addDirectLight(scene: THREE.Scene) {
    const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    scene.add(light);
}

function createCamera() {
    const heightData = generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000)
    camera.position.y = heightData[ terrainHalfWidth + terrainHalfDepth * terrainWidth ] * ( terrainMaxHeight - terrainMinHeight ) + 5;
    camera.position.z = terrainDepthExtents / 2;
    camera.lookAt( 0, 0, 0 );
    return camera
}

async function createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    // add scene
    const scene = await createScene()
    renderer.render(scene, createCamera())

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
            createCamera()
        )
    }

    public async render() {
        this.renderer.render(this.scene, this.camera)
    }
}

function generateHeight( width: number, depth: number, minHeight: number, maxHeight: number ) {

    // Generates the height data (a sinus wave)

    const size = width * depth;
    const data = new Float32Array( size );

    const hRange = maxHeight - minHeight;
    const w2 = width / 2;
    const d2 = depth / 2;
    const phaseMult = 12;

    let p = 0;

    for ( let j = 0; j < depth; j ++ ) {

        for ( let i = 0; i < width; i ++ ) {

            const radius = Math.sqrt(
                Math.pow( ( i - w2 ) / w2, 2.0 ) +
                Math.pow( ( j - d2 ) / d2, 2.0 ) );

            const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;

            data[ p ] = height;

            p ++;

        }

    }

    return data;
}
