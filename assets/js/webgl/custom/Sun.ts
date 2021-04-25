import { Group, Vector3, Object3D } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

class Sun extends Object3D {
    name: string

    constructor(
        name: string,
        model: GLTF
    ) {
        super()
        
        this.name = name

        this.add(model.scene.children[0].clone())
        this.scale.set(0.05, 0.05, 0.05)
        this.visible = false
    }
}

export default Sun
