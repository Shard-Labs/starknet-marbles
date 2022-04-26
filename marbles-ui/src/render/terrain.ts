import * as THREE from 'three';
import { WIDTH, DEPTH, MIN_HEIGHT, MAX_HEIGHT } from '~/lib/constants';
import { generateHeight} from '~/lib/utils'

const heightData = generateHeight(WIDTH, DEPTH, MIN_HEIGHT, MAX_HEIGHT)

class Terrain {
    private _geometry: THREE.BufferGeometry;
    private _material: THREE.Material;
    private _mesh: THREE.Mesh;

    private constructor(
        private _width: number,
        private _depth: number,
        private _widthSegments: number,
        private _heightSegments: number,
        private _texture: any
    ) {
        this._geometry = new THREE.PlaneGeometry(100, 100, 127, 127);
        this._geometry.rotateX( - Math.PI / 2 );

        const vertices = this._geometry.attributes.position.array;
        console.log(vertices);
        console.log(heightData)

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
         depth: number,
         widthSegments: number,
         depthSegments: number,
         texture: any
    ): Terrain {
        return new Terrain(
            width,
            depth,
            widthSegments,
            depthSegments,
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

export async function renderTerrain () {
    const texture = await getTexture();
    console.log(WIDTH);
    const terrain = Terrain.create(WIDTH, DEPTH, 10, 10, texture);

    return terrain.mesh;
}
