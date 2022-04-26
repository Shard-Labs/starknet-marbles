import * as THREE from 'three';
import { renderTerrain } from '~/render/terrain'

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

export async function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    addAmbientLight(scene);
    addDirectLight(scene);

    return scene;
}
