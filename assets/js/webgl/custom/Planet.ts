import { Group, Vector3 } from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import EventBus from "../../utils/EventBus";
import { GLEvents } from "../../utils/Events";
import Scene from "../core/Scene";
import Bubble from "./Bubble";
import CustomInteractionManager from "../../utils/managers/CustomInteractionManager";

class Planet extends Group {
    name: string
    bubble: Bubble
    object: GLTF|undefined
    scenery: GLTF|undefined
    isComplete: boolean
    initialPosition: Vector3
    scene: Scene
    canClick: boolean

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
        CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera).remove(this)
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
        }
    }

    listenEvents () {
        CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera).add(this)

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
        CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera).remove(this)

        this.removeEventListener('click', () => {})
        this.removeEventListener('mouseover', () => {})
        this.removeEventListener('mouseout', () => {})
    }

    update(elapsedTime: number) {
        if (this.object && this.object.scene.visible) {
            if (this.isComplete) {
                // TODO : Talk with designers to be more precise about the movement we want the Bubbles to achieve
                // todo: improve orbit movement
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
