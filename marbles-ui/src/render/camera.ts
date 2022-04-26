import * as THREE from 'three'
import { generateHeight} from '~/lib/utils';

export function createCamera(width: number, depth: number, minHeight: number, maxHeight: number) {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const heightData = generateHeight( width, depth, minHeight, maxHeight );
    const depthExtents = depth + 28;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000)
    camera.position.y = heightData[ halfWidth + halfDepth * width ] * ( maxHeight - minHeight ) + 5;
    camera.position.z = depthExtents / 2.3;
    camera.lookAt( 0, 0, 0 );
    return camera
}

