import { AnimationAction, AnimationClip, AnimationMixer, Group, LoopOnce, Object3D, Vector3 } from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import EventBus from "../../utils/EventBus";
import { GLEvents } from "../../utils/Events";
import Scene from "../core/Scene";
import Bubble from "./Bubble";
import CustomInteractionManager from "../../utils/managers/CustomInteractionManager";
import HighlightManager from "../../utils/managers/HighlightManager";

class Planet extends Group {
    name: string
    bubble: Bubble
    object: GLTF|undefined
    scenery: GLTF|undefined
    animationTool: any
    animationTarget: any
    isComplete: boolean
    initialPosition: Vector3
    scene: Scene
    canClick: boolean
    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    animationManager?: AnimationMixer 
    sceneryAnimation?: AnimationAction
    isAboveTarget: boolean

    constructor(
        scene: Scene,
        name: string,
        object: GLTF|undefined,
        scenery: GLTF|undefined,
        initialPosition: Vector3,
        ySceneryPosition: number
    ) {
        super()

        this.name = name
        this.scene = scene

        // TODO : We should but both managers in the scene & do this.scene.interactionManager
        this.interactionManager = CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera)
        this.highlightManager = HighlightManager.getInstance(this.scene.renderer, this.scene, this.scene.camera)
        this.isAboveTarget = false

        this.initialPosition = initialPosition
        this.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)
        this.isComplete = false

        this.rotation.y = this.rotation.y + Math.PI

        this.canClick = true

        // TODO : Is there no other solution than passing scene & renderer through all objects so that Bubble has access to it ?
        // TODO : Detect the change on this.isComplete pour dispose la Bulle
        this.bubble = new Bubble(2.5, 12, scene, scene.renderer)
        this.add(this.bubble.mesh)
                
        if (object) {
            this.object = object
            this.object.scene.scale.set(0.015, 0.015, 0.015)
            this.object.scene.position.y = -0.5
            this.add(object.scene);
        }

        if (scenery) {
            this.scenery = scenery
            this.scenery.scene.visible = false
            this.scenery.scene.position.y = ySceneryPosition
            this.scenery.scene.scale.set(0.005, 0.005, 0.005)

            this.add(scenery.scene)
        }

        this.visible = false

        EventBus.on(GLEvents.UPDATE, (e: any) => this.update(e.elapsedTime))
        EventBus.on(GLEvents.CLICK, () => { this.isComplete ? this.isComplete = false : this.isComplete = true })
    }

    complete () {
        this.isComplete = true
        this.canClick = false
        if (this.scenery) {
            this.remove(this.scenery.scene)
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
            this.object.scene.visible = visible
            this.scenery.scene.visible = !visible
            this.object.scene.scale.set(0.015, 0.015, 0.015)
            this.listenEvents()
        }
    }

    triggerScenery (visible: boolean) {
        if (this.scenery && this.object) {
            this.object.scene.visible = !visible
            this.scenery.scene.visible = visible
            this.scenery.scene.scale.set(0.04, 0.04, 0.04)
            this.removeBubble()
            this.removeEvents()
            this.setupScenery()
        }
    }

    setupScenery() {
        if (this.scenery) {
            EventBus.emit(GLEvents.UPDATE_HIGHLIGHT_MANAGER, true)
            EventBus.emit(GLEvents.UPDATE_INTERACTION_MANAGER, true)

            this.animationManager = new AnimationMixer(this.scenery.scene)
            this.sceneryAnimation = this.animationManager.clipAction(this.scenery.animations[0])
            this.sceneryAnimation.setLoop(LoopOnce, 1)

            this.scenery.scene.traverse((child: any) => {
                if (child.name === 'flowerbandana') {
                    this.animationTool = child
                }
                if (child.name === 'gun') {
                    this.animationTarget = child
                    console.log("GUN", this.animationTarget)
                }
            })

            if (this.animationTool && this.animationTarget) {
                console.log(this.animationTarget)
                this.interactionManager.add(this.animationTool)
                this.interactionManager.add(this.animationTarget)

                // NOTE : We indicate that scissors are an interactive & draggable object$
                this.scene.dragControls.transformGroup = true
                this.scene.draggableObjects.push(this.animationTool) // Draggable
                this.highlightManager.add(this.animationTool) // Highlighted

                this.animationTool.addEventListener('mouseover', (e: any) => {
                    // NOTE : We will able to fire an event to Custom Cursor 
                    document.body.style.cursor = 'pointer';
                })

                this.scene.dragControls.addEventListener('dragstart', this.onDragStart)
                this.scene.dragControls.addEventListener('dragend', this.onDragEnd)
            } else {
                console.error("Tool or Target undefined : ", this.animationTool, this.animationTarget)
            }
        }
    }

    // NOTE : A function in the AnimationManager that takes an animation as param ? 
    launchAnimation() {
        console.log("ANIM LO")
        this.sceneryAnimation!.play()
        this.sceneryAnimation!.clampWhenFinished = true
    }

    toggleTargetState() {
        this.isAboveTarget = !this.isAboveTarget
        console.log(this.isAboveTarget ? "LE FUSI LO" : "PA LE FUSI LO")
    }

    onDragStart() {
        console.log(this.animationTarget)
        console.log("DRAG")
        this.animationTarget.addEventListener('mouseover', this.toggleTargetState)
        this.animationTarget.addEventListener('mouseout', this.toggleTargetState)
    }

    onDragEnd() {
        console.log("PU DRAG")
        this.animationTarget.removeEventListener('mouseover', this.toggleTargetState)
        this.animationTarget.removeEventListener('mouseout', this.toggleTargetState)

        if (this.isAboveTarget) {
            // NOTE : Should be there that we make possible to open the PlanetModal displaying course once animation is over
            this.animationTool.visible = false
            this.launchAnimation()
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
        if (this.object && this.object.scene.visible) {
            if (this.isComplete) {
                // TODO : Talk with designers to be more precise about the movement we want the Bubbles to achieve
                // TODO: improve orbit movement
                this.position.set(
                    this.initialPosition.x * Math.cos(elapsedTime),
                    Math.sin( elapsedTime ) * .3,
                    this.initialPosition.z * Math.sin(elapsedTime),
                )
            } else {
                const angle = elapsedTime * 2
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
