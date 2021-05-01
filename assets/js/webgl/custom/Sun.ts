import { Group, Vector3, Object3D, Mesh, AnimationMixer, LoopOnce, LoopRepeat } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import EventBus from "../../utils/EventBus"
import { GLEvents } from "../../utils/Events"

class Sun extends Object3D {
    name: string

    constructor(
        name: string,
        model: GLTF
    ) {
        super()
        
        this.name = name

        this.launchAnimation(model)

        this.add(model.scene)
        this.scale.set(0.05, 0.05, 0.05)
        this.rotation.y = this.rotation.y + Math.PI
        this.visible = false

        if (this.name === 'quiz_sun') {
            this.illuminateQuiz(model)
        }
        
    }

    launchAnimation (model: GLTF) {
        if (model.animations.length) {
            const animationMixer = new AnimationMixer(model.scene)
            const action = animationMixer.clipAction(model.animations[0])
            action.play()

            EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
                animationMixer.update(deltaTime)
            })
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
