import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { Vector3, AnimationMixer, DirectionalLight } from "three"
import EventBus from "../../utils/EventBus"
import { GLEvents, AnimationEvents, UIEvents } from "../../utils/Events"
import Scene from "../core/Scene"

class SceneryCharacter {
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
        this.model.scene.add(themeLight)

        this.model.scene.visible = false

        switch (this.name) {
            case 'mode_scenery_skirt_character':
                this.model.scene.scale.set(5, 5, 5)
                break
            case 'mode_scenery_hippie_character':
                this.model.scene.scale.set(3.8, 3.8, 3.8)
                break
            default:
                this.model.scene.scale.set(4, 4, 4)
                break
        }
        
        this.model.scene.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)

        this.isAnimated = true
    }

    launchAnimation (scene: Scene) {
        if (this.model.animations.length && this.isAnimated) {
            let animationMixer = new AnimationMixer(this.model.scene)
            switch (this.name) {
                case 'mode_scenery_rock_character':
                    this.handleRockerAnimations(animationMixer, scene)
                    break
                case 'mode_scenery_hippie_character':
                    this.handleHippierAnimations(animationMixer)
                    break
                case 'mode_scenery_skirt_character':
                    this.handleMaryAnimations(animationMixer)
                    break
            }

            EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
                animationMixer.update(deltaTime)
            })
        }
    }

    handleRockerAnimations (animationMixer: AnimationMixer, scene: Scene) {
        let action = animationMixer.clipAction(this.model.animations[0])
        action.play()

        EventBus.on(UIEvents.RELAUNCH_ROCK_ANIMATION, () => {
            action.stop()
            action = animationMixer.clipAction(this.model.animations[3])
            action.play()
            setTimeout(() => {
                EventBus.emit(UIEvents.SHOW_LOGO_RS)
            }, 1600)
            setTimeout(() => {
                action.paused = true
            }, 3000)
        })

        EventBus.on(GLEvents.LETS_GO, () => {
            EventBus.emit(AnimationEvents.LAUNCH_LOGO_ANIMATION)
            EventBus.on(AnimationEvents.ENDED_LOGO_ANIMATION, () => {
                action.paused = false
                setTimeout(() => {
                    action.stop()
                    action = animationMixer.clipAction(this.model.animations[0])
                    action.play()
                    EventBus.emit(UIEvents.SHOW_SCENERY_INTERACTION_INSTRUCTION, false)
                    scene.cameraAnimationManager.sceneryInteractionDezoom()
                }, 4000)
            })
        })
    }

    handleHippierAnimations (animationMixer: AnimationMixer) {
        let action = animationMixer.clipAction(this.model.animations[0])
        action.play()     

        EventBus.on(GLEvents.LETS_GO, () => {
            action.stop()
            action = animationMixer.clipAction(this.model.animations[3])
            action.play()
            setTimeout(() => {
                action.stop()
                action = animationMixer.clipAction(this.model.animations[1])
                action.play()
            }, 3000)
        })
    }

    handleMaryAnimations (animationMixer: AnimationMixer) {
        let action = animationMixer.clipAction(this.model.animations[0])
        action.play()
    }
}

export default SceneryCharacter
