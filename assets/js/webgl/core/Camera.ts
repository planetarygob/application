import { PerspectiveCamera } from 'three';

class Camera extends PerspectiveCamera {

    constructor(FOV: number, aspect: number, near: number, far: number) {
        super(FOV, aspect, near, far)
        this.position.set(50, 10, -25)
        this.layers.enable(1)
    }
}

export default Camera