import { Group, Vector3, Object3D, Mesh, AnimationMixer, LoopOnce, LoopRepeat } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import EventBus from "../../utils/EventBus"
import { GLEvents } from "../../utils/Events"

class Sun extends Object3D {
    name: string
    model: GLTF

    constructor(
        name: string,
        model: GLTF,
        floatFactor: number
    ) {
        super()
        
        this.name = name
        this.model = model

        this.launchAnimation()
        this.launchFlotation(floatFactor)

        this.add(this.model.scene)
        this.scale.set(0.05, 0.05, 0.05)
        this.rotation.y = this.rotation.y + Math.PI
        this.visible = false

        if (this.name === 'quiz_sun') {
            this.illuminateQuiz(model)
        }
        
    }

    launchAnimation () {
        if (this.model.animations.length) {
            const animationMixer = new AnimationMixer(this.model.scene)
            const action = animationMixer.clipAction(this.model.animations[0])
            action.play()

            EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
                animationMixer.update(deltaTime)
            })
        }
    }

    launchFlotation (floatFactor: number) {
        EventBus.on(GLEvents.UPDATE, (elapsedTime) => {
            this.position.set(
                this.model.scene.position.x,
                this.model.scene.position.y + Math.sin(elapsedTime * floatFactor) / 2.5,
                this.model.scene.position.z,
            )
        })
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
