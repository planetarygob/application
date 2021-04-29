import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationAction, AnimationMixer, AnimationClip } from "three"
import AnimationObject from "./AnimationObject"
import EventBus from "../../utils/EventBus"
import { GLEvents, UIEvents } from "../../utils/Events"
import Scene from "../core/Scene"

class GLTFAnimation {
    model: GLTF|null
    clip: AnimationClip
    action: AnimationAction|null
    mixer: AnimationMixer|null
    animationTool: AnimationObject
    animationTarget: AnimationObject
    isAboveTarget: boolean

    constructor (
        model: GLTF|null,
        clip: AnimationClip,
        action: AnimationAction|null,
        mixer: AnimationMixer|null,
        animationTool: AnimationObject,
        animationTarget: AnimationObject
    ) { 
        this.model = model
        this.clip = clip
        this.action = action
        this.mixer = mixer
        this.animationTool = animationTool
        this.animationTarget = animationTarget

        this.isAboveTarget = false
    }

    // NOTE : A function in the AnimationManager that takes an animation as param ? 
    launchAnimation (scene: Scene) {
        if (this.action) {
            EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, true)

            this.action.play()
            this.action.clampWhenFinished = true

            if (scene.animationMixer) {
                scene.animationMixer.addEventListener('finished', () => {
                    EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, false)
                    EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                })
            }
        }
    }

    toggleTargetState (scene: Scene) {
        this.isAboveTarget = !this.isAboveTarget

        if (this.isAboveTarget && this.animationTool.model) {
            // NOTE : Should be there that we make possible to open the PlanetModal displaying course once animation is over
            this.animationTool.model.visible = false
            this.launchAnimation(scene)
        }
    }

    onDragStart (scene: Scene) {
        if (this.animationTarget.model) {
            this.animationTarget.model.addEventListener('mouseover', this.toggleTargetState.bind(this, scene))
            this.animationTarget.model.addEventListener('mouseout', this.toggleTargetState.bind(this, scene))
        }   
    }

    onDragEnd (scene: Scene) {
        if (this.animationTarget.model) {
            this.animationTarget.model.removeEventListener('mouseover', this.toggleTargetState.bind(this, scene))
            this.animationTarget.model.removeEventListener('mouseout', this.toggleTargetState.bind(this, scene))
        }
    }
}

export default GLTFAnimation
