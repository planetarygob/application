import { Object3D, Mesh } from "three"

class AnimationObject {
    name: string
    model?: Object3D|null

    constructor(
        name: string,
        model: Object3D|null
    ) {
        this.name = name
        this.model = model
    }
}

export default AnimationObject
