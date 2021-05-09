import { Group, BoxGeometry, MeshBasicMaterial, Mesh } from "three";
import EventBus from "../../utils/EventBus";
import { GLEvents, UIEvents, ProgressBarEvents } from "../../utils/Events";
import Scene from "../core/Scene";
import PlanetScenery from './PlanetScenery'
import PlanetObject from './PlanetObject'
import Bubble from "./Bubble";

class Planet extends Group {
    name: string
    systemName: string
    bubble: Bubble
    object: PlanetObject|undefined
    scenery: PlanetScenery|undefined
    isComplete: boolean
    infos: any
    scene: Scene
    canClick: boolean

    constructor(
        scene: Scene,
        name: string,
        systemName: string,
        object: PlanetObject|undefined,
        scenery: PlanetScenery|undefined,
        infos: any
    ) {
        super()

        this.scene = scene
        this.name = name
        this.systemName = systemName
        this.object = object
        this.scenery = scenery
        this.infos = infos
        this.position.set(this.infos.initialPosition.x, this.infos.initialPosition.y, this.infos.initialPosition.z)
        this.isComplete = false

        this.rotation.y = this.rotation.y + Math.PI

        this.canClick = true

        // TODO : Is there no other solution than passing scene & renderer through all objects so that Bubble has access to it ?
        // TODO : Detect the change on this.isComplete pour dispose la Bulle
        this.bubble = new Bubble(2.5, 12, scene, scene.renderer)
        this.add(this.bubble.mesh)
                
        if (object) {
            this.add(object.model.scene)
        }

        if (scenery) {
            this.add(scenery.model.scene)
            if (scenery.character) {
                this.add(scenery.character.model.scene)
            }
            if (scenery.logo) {
                this.add(scenery.logo.model.scene)
            }
        }

        this.visible = false

        EventBus.on<number>(GLEvents.UPDATE, (elapsedTime) => {
            if (elapsedTime !== undefined) {
                this.update(elapsedTime)
            }
        })
        EventBus.on(GLEvents.CLICK, () => { this.isComplete ? this.isComplete = false : this.isComplete = true })
    }

    complete () {
        this.isComplete = true
        this.canClick = false
        if (this.scenery) {
            this.remove(this.scenery.model.scene)
            this.scenery = undefined
        }
        // NOTE : We update the ProgressBar component with needed parameters
        EventBus.emit(ProgressBarEvents.UPDATE_PROGRESS_BAR, { name : this.systemName, index : this.infos.index })
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
            if (this.scenery.character) {
                this.scenery.character.model.scene.visible = !visible
            }
            this.object.model.scene.scale.set(0.015, 0.015, 0.015)
            this.listenEvents()
        }
    }

    triggerScenery (visible: boolean) {
        if (this.scenery && this.object) {
            this.object.model.scene.visible = !visible
            this.scenery.model.scene.visible = visible
            this.scenery.model.scene.scale.set(0.04, 0.04, 0.04)
            if (this.scenery.character) {
                this.scenery.character.model.scene.visible = visible
                this.scenery.character.launchAnimation(this.scene)
            }
            this.removeBubble()
            this.removeEvents()
            EventBus.on(GLEvents.SETUP_SCENERY_INTERACTION, () => {
                if (this.scenery) {
                    this.scene.cameraAnimationManager.sceneryInteractionZoom()
                    EventBus.emit(UIEvents.SHOW_SCENERY_INTERACTION_INSTRUCTION, true)
                    this.scenery.setupSceneryInteraction(this.scene)
                }
            })
        }
    }

    listenEvents () {
        this.scene.interactionManager.add(this)

        this.addEventListener('click', () => {
            if (this.canClick) {
                this.canClick = false
                EventBus.emit(GLEvents.CLICK_PLANET, this)
                this.removeEvents()
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
        this.scene.interactionManager.remove(this)
        this.removeEventListener('click', () => {})
        this.removeEventListener('mouseover', () => {})
        this.removeEventListener('mouseout', () => {})
    }

    update(elapsedTime: number) {
        if (this.object && this.object.model.scene.visible) {
            const angle = elapsedTime * this.infos.orbitSpeed

            if (this.isComplete) {
                // TODO : Talk with designers to be more precise about the movement we want the Bubbles to achieve
                // TODO: improve orbit movement
                this.position.set(
                    this.infos.orbitRange * Math.cos(angle),
                    1,
                    this.infos.orbitRange * Math.sin(angle),
                )
            } else {
                
                // TODO : Use initial position of Bubble / Planet instead of 0. Keep in mind it will be related to System coordinates & not Scene
                this.position.set(
                    this.infos.initialPosition.x,
                    this.infos.initialPosition.y + Math.sin(elapsedTime * this.infos.floatFactor),
                    this.infos.initialPosition.z,
                )
            }
        }
    }
}

export default Planet
