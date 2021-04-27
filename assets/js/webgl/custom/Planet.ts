import { AnimationAction, AnimationClip, AnimationMixer, Group, LoopOnce, Object3D, Vector3 } from "three";
import EventBus from "../../utils/EventBus";
import { GLEvents, UIEvents } from "../../utils/Events";
import Scene from "../core/Scene";
import PlanetScenery from './PlanetScenery'
import PlanetObject from './PlanetObject'
import Bubble from "./Bubble";
import CustomInteractionManager from "../../utils/managers/CustomInteractionManager";
import HighlightManager from "../../utils/managers/HighlightManager";

class Planet extends Group {
    name: string
    bubble: Bubble
    object: PlanetObject|undefined
    scenery: PlanetScenery|undefined
    isComplete: boolean
    initialPosition: Vector3
    scene: Scene
    canClick: boolean

    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    animationMixer?: AnimationMixer 
    sceneryAnimation?: AnimationAction
    isAboveTarget: boolean

    constructor(
        scene: Scene,
        name: string,
        object: PlanetObject|undefined,
        scenery: PlanetScenery|undefined,
        initialPosition: Vector3
    ) {
        super()

        this.name = name
        this.scene = scene
        this.object = object
        this.scenery = scenery

        // TODO : We should but both managers in the scene & do this.scene.interactionManager
        this.interactionManager = CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera)
        this.highlightManager = HighlightManager.getInstance(this.scene.renderer, this.scene, this.scene.camera)
        this.isAboveTarget = false

        this.initialPosition = initialPosition
        this.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)
        this.isComplete = false

        this.rotation.y = this.rotation.y + Math.PI

        this.canClick = true

        EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
            if (this.animationMixer) {
                this.animationMixer.update(deltaTime)
            }
        })

        // TODO : Is there no other solution than passing scene & renderer through all objects so that Bubble has access to it ?
        // TODO : Detect the change on this.isComplete pour dispose la Bulle
        this.bubble = new Bubble(2.5, 12, scene, scene.renderer)
        this.add(this.bubble.mesh)
                
        if (object) {
            this.add(object.model.scene)
        }

        if (scenery) {
            this.add(scenery.model.scene)
        }

        this.visible = false

        EventBus.on(GLEvents.UPDATE, (e: any) => this.update(e.elapsedTime))
        EventBus.on(GLEvents.CLICK, () => { this.isComplete ? this.isComplete = false : this.isComplete = true })
    }

    complete () {
        this.isComplete = true
        this.canClick = false
        if (this.scenery) {
            this.remove(this.scenery.model.scene)
            this.scenery = undefined
        }
        this.interactionManager.remove(this)
        // this.removeEvents()
    }

    removeBubble () {
        this.remove(this.bubble.mesh)
        // TODO
        // this.bubble.dispose
    }

    triggerPlanet (visible: boolean) {
        this.visible = visible
        this.listenEvents()
    }

    triggerObject (visible: boolean) {
        if (this.object && this.scenery) {
            this.object.model.scene.visible = visible
            this.scenery.model.scene.visible = !visible
            this.object.model.scene.scale.set(0.015, 0.015, 0.015)
            this.listenEvents()
        }
    }

    triggerScenery (visible: boolean) {
        if (this.scenery && this.object) {
            this.object.model.scene.visible = !visible
            this.scenery.model.scene.visible = visible
            this.scenery.model.scene.scale.set(0.04, 0.04, 0.04)
            this.removeBubble()
            this.removeEvents()
            this.setupScenery()
        }
    }

    setupScenery() {
        if (this.scenery && this.scenery.interaction.animationTool.model && this.scenery.interaction.animationTarget.model) {
            EventBus.emit(GLEvents.HIGHLIGHT_MANAGER_REQUIRED, true)

            this.animationMixer = new AnimationMixer(this.scenery.model.scene)

            if (this.scenery.model.animations.length) {
                const animation = this.scenery.model.animations[0]
                this.sceneryAnimation = this.animationMixer.clipAction(animation)
                this.sceneryAnimation.setLoop(LoopOnce, 1)
                console.log("ANIM", this.sceneryAnimation)

                // NOTE : We indicate that scissors are an interactive & draggable object$
                if (this.scene.draggableObjects.length) {
                    this.scene.draggableObjects.shift()
                }
                this.scene.draggableObjects.push(this.scenery.interaction.animationTool.model) // Draggable
                this.scene.dragControls.transformGroup = true
                
                this.highlightManager.outlinePass.selectedObjects = [this.scenery.interaction.animationTool.model]

                this.scene.dragControls.addEventListener('dragstart', this.onDragStart.bind(this))
                this.scene.dragControls.addEventListener('dragend', this.onDragEnd.bind(this))

                this.interactionManager.add(this.scenery.interaction.animationTarget.model)
                // this.interactionManager.add(this.animationTool)
            }
        } else {
            console.error("Tool or Target undefined")
        }
    }

    // NOTE : A function in the AnimationManager that takes an animation as param ? 
    launchAnimation() {
        if (this.sceneryAnimation) {
            EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, true)

            this.sceneryAnimation.play()
            this.sceneryAnimation.clampWhenFinished = true

            if (this.animationMixer) {
                this.animationMixer.addEventListener('finished', () => {
                    EventBus.emit(GLEvents.ANIMATION_MIXER_REQUIRED, false)
                    EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                })
            }
        }
    }

    toggleTargetState() {
        this.isAboveTarget = !this.isAboveTarget

        if (this.isAboveTarget && this.scenery && this.scenery.interaction.animationTool.model) {
            // NOTE : Should be there that we make possible to open the PlanetModal displaying course once animation is over
            this.scenery.interaction.animationTool.model.visible = false
            this.launchAnimation()
        }
    }

    onDragStart() {
        if (this.scenery && this.scenery.interaction.animationTarget.model) {
            this.scenery.interaction.animationTarget.model.addEventListener('mouseover', this.toggleTargetState.bind(this))
            this.scenery.interaction.animationTarget.model.addEventListener('mouseout', this.toggleTargetState.bind(this))
        }   
    }

    onDragEnd() {
        if (this.scenery && this.scenery.interaction.animationTarget.model) {
            this.scenery.interaction.animationTarget.model.removeEventListener('mouseover', this.toggleTargetState.bind(this))
            this.scenery.interaction.animationTarget.model.removeEventListener('mouseout', this.toggleTargetState.bind(this))
        }
    }

    listenEvents () {
        this.interactionManager.add(this)

        this.addEventListener('click', () => {
            if (this.canClick) {
                this.canClick = false
                EventBus.emit(GLEvents.CLICK_PLANET, this)
            }
        })
        this.addEventListener('mouseover', () => {
            EventBus.emit(GLEvents.MOUSE_OVER_PLANET, this)
        })
        this.addEventListener('mouseout', () => {
            EventBus.emit(GLEvents.MOUSE_OUT_PLANET, this)
        })
    }

    removeEvents () {
        this.removeEventListener('click', () => {})
        this.removeEventListener('mouseover', () => {})
        this.removeEventListener('mouseout', () => {})
    }

    update(elapsedTime: number) {
        if (this.object && this.object.model.scene.visible) {
            const angle = elapsedTime * 2

            if (this.isComplete) {
                // TODO : Talk with designers to be more precise about the movement we want the Bubbles to achieve
                // TODO: improve orbit movement
                this.position.set(
                    (this.initialPosition.x -2) * Math.cos(elapsedTime),
                    (this.initialPosition.y - 2) * Math.sin(elapsedTime),
                    (this.initialPosition.z - 2) * Math.sin(elapsedTime),
                )
            } else {
                
                // TODO : Use initial position of Bubble / Planet instead of 0. Keep in mind it will be related to System coordinates & not Scene
                this.position.set(
                    this.initialPosition.x,
                    this.initialPosition.y + Math.sin(angle),
                    this.initialPosition.z,
                )
            }
        }
    }
}

export default Planet
