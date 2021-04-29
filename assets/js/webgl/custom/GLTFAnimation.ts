import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationAction, AnimationMixer, AnimationClip, Vector3 } from "three"
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
    toolShouldFlotate: boolean

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
        this.toolShouldFlotate = true
    }

    updateToolScale (elapsedTime: number, initialScale: Vector3) {
        if (this.animationTool.model && this.toolShouldFlotate) {
            this.animationTool.model.scale.set(
                initialScale.x + Math.sin(elapsedTime * 2) / 8,
                initialScale.y + Math.sin(elapsedTime * 2) / 8,
                initialScale.z + Math.sin(elapsedTime * 2) / 8
            )
        }
    }

    // NOTE : A function in the AnimationManager that takes an animation as param ? 
    launchAnimation (scene: Scene) {
        if (this.action) {
            EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, true)

            this.action.play()
            this.action.clampWhenFinished = true

            scene.highlightManager.outlinePass.selectedObjects.shift()

            if (scene.animationMixer) {
                scene.animationMixer.addEventListener('finished', () => {
                    EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, false)
                    EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                })
            }
        }
    }

    onDragStart (scene: Scene) {
        if (this.animationTarget.model) {
            this.toolShouldFlotate = false
            scene.highlightManager.outlinePass.selectedObjects.shift()
            scene.highlightManager.outlinePass.selectedObjects.push(this.animationTarget.model)

            EventBus.emit(GLEvents.INTERACTION_MANAGER_REQUIRED, true)

            this.animationTarget.model.addEventListener('mouseover', () => {
                if (!this.isAboveTarget) {
                    this.isAboveTarget = true
                }
            })
            this.animationTarget.model.addEventListener('mouseout', () => {
                if (this.isAboveTarget) {
                    this.isAboveTarget = false
                }
            })
        }   
    }

    onDragEnd (scene: Scene) {
        if (this.animationTarget.model && this.animationTool.model) {
            scene.highlightManager.outlinePass.selectedObjects.shift()
            scene.highlightManager.outlinePass.selectedObjects.push(this.animationTool.model)

            if (this.isAboveTarget && this.animationTool.model) {
                EventBus.emit(GLEvents.INTERACTION_MANAGER_REQUIRED, false)
                this.animationTool.model.visible = false
                this.launchAnimation(scene)
                this.animationTarget.model.removeEventListener('mouseover', () => {})
                this.animationTarget.model.removeEventListener('mouseout', () => {})
            }
        }
    }
}

export default GLTFAnimation
