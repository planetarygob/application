import { PerspectiveCamera } from 'three';

class Camera extends PerspectiveCamera {

    constructor(FOV: number, aspect: number, near: number, far: number) {
        super(FOV, aspect, near, far)
        this.position.set(0, 10, -25)

    }
}

export default Camera