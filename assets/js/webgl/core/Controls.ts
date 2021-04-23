import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Controls extends OrbitControls {

    constructor(camera: any, canvas: any) {
        super(camera, canvas)
        this.enableZoom = false
        this.enableRotate = false
        this.enablePan = false
    }
}

export default Controls