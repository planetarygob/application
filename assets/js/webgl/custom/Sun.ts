import { Group, Vector3, Object3D, Mesh } from "three"
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
        this.rotation.y = this.rotation.y + Math.PI
        this.visible = false

        if (this.name === 'quiz_sun') {
            console.log('quiz ok', );
            this.illuminateQuiz(model)
        }
        
    }

    illuminateQuiz(model: GLTF) {
        model.scene.traverse((child: any) => {
            if (child instanceof Mesh) {
                child.material.opacity = 0.2
                child.material.transparent = true
            }
        })
    }
}

export default Sun
