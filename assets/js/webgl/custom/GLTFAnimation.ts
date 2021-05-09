import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { AnimationAction, AnimationMixer, AnimationClip, Vector3, Object3D } from "three"
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
    toolShouldScale: boolean

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
        this.toolShouldScale = true
    }

    updateToolScaleAnimation (elapsedTime: number, initialScale: Vector3) {
        if (this.animationTool.model && this.toolShouldScale) {
            this.animationTool.model.scale.set(
                initialScale.x + Math.sin(elapsedTime * 2) / 8,
                initialScale.y + Math.sin(elapsedTime * 2) / 8,
                initialScale.z + Math.sin(elapsedTime * 2) / 8
            )
        }
    }

    launchAnimation (scene: Scene) {
        if (this.action) {
            this.action.play()
            this.action.clampWhenFinished = true

            scene.highlightManager.empty()

            if (scene.animationMixer && this.animationTool.name !== 'aiguille') {
                scene.animationMixer.addEventListener('finished', () => {
                    EventBus.emit(UIEvents.SHOW_SCENERY_INTERACTION_INSTRUCTION, false)
                    scene.cameraAnimationManager.sceneryInteractionDezoom()
                    // EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                    scene.dragControls.deactivate()
                })
            }
        }
    }

    onDragStart (scene: Scene) {
        if (this.animationTarget.model) {
            this.toolShouldScale = false
            scene.highlightManager.empty()
            scene.highlightManager.add(this.animationTarget.model)

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

    onDragEnd (scene: Scene, hiddenObjects: Array<Object3D>|null) {
        if (this.animationTarget.model && this.animationTool.model) {
            scene.highlightManager.empty()
            scene.highlightManager.add(this.animationTool.model)

            if (this.isAboveTarget && this.animationTool.model) {
                EventBus.emit(GLEvents.INTERACTION_MANAGER_REQUIRED, false)
                this.animationTool.model.visible = false
                EventBus.emit(GLEvents.LETS_GO)
                this.launchAnimation(scene)
                this.animationTarget.model.removeEventListener('mouseover', () => {})
                this.animationTarget.model.removeEventListener('mouseout', () => {})

                if (hiddenObjects) {
                    for (let object of hiddenObjects) {
                        if (object.name !== 'flowerbandana') {
                            object.visible = true
                        }
                    }
                }
            }
        }
    }
}

export default GLTFAnimation
