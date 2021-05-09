import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { Vector3, PointLight, AmbientLight, AnimationMixer, DirectionalLight } from "three"
import EventBus from "../../utils/EventBus"
import { GLEvents, AnimationEvents, UIEvents } from "../../utils/Events"
import GUI from "../../utils/dev/GUI"

class SceneryLogo {
    name: string
    model: GLTF
    initialPosition: Vector3
    isAnimated: boolean

    constructor (
        name: string,
        model: GLTF,
        initialPosition: Vector3
    ) { 

        this.name = name
        this.model = model
        this.initialPosition = initialPosition

        const themeLight = new DirectionalLight('#ffffff', 1)
        themeLight.position.set(0, 70, 100)
        // this.model.scene.add(themeLight)

        this.model.scene.visible = false

        EventBus.on(UIEvents.SHOW_LOGO_RS, () => {
            this.model.scene.visible = true
        })

        this.isAnimated = true

        EventBus.on(AnimationEvents.LAUNCH_LOGO_ANIMATION, () => {
            this.launchAnimation()
        })
    }

    launchAnimation () {
        if (this.model.animations.length && this.isAnimated) {
            const animationMixer = new AnimationMixer(this.model.scene)
            const action = animationMixer.clipAction(this.model.animations[0])
            action.play()

            setTimeout(() => {
                action.paused = true
                EventBus.emit(AnimationEvents.ENDED_LOGO_ANIMATION)
                setTimeout(() => {
                    action.stop()
                    this.model.scene.visible = false
                }, 1700)
            }, 2500)

            EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
                animationMixer.update(deltaTime)
            })
        }
    }
}

export default SceneryLogo
