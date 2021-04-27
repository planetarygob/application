import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

class PlanetObject {
    name: string
    model: GLTF

    constructor (
        name: string,
        model: GLTF
    ) { 
        this.name = name
        this.model = model

        this.model.scene.scale.set(0.015, 0.015, 0.015)
        this.model.scene.position.y = -0.5
    }
}

export default PlanetObject
