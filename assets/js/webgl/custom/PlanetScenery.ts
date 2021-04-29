import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import GLTFAnimation from './GLTFAnimation'
import Scene from "../core/Scene"
import EventBus from "../../utils/EventBus"
import { GLEvents, UIEvents } from "../../utils/Events"
import { AnimationMixer, LoopOnce } from "three"

class PlanetScenery {
    name: string
    model: GLTF
    yPosition: number
    animation: GLTFAnimation|null

    constructor (
        name: string,
        model: GLTF,
        yPosition: number,
        animation: GLTFAnimation|null
    ) { 
        this.name = name
        this.model = model
        this.yPosition = yPosition
        this.animation = animation

        this.model.scene.visible = false
        this.model.scene.position.y = this.yPosition
        this.model.scene.scale.set(0.005, 0.005, 0.005)

        if (this.animation) {
            this.model.scene.traverse((child: any) => {
                if (child.name === this.animation!.animationTool.name) {
                    this.animation!.animationTool.model = child
                }
                if (child.name === this.animation!.animationTarget.name) {
                    this.animation!.animationTarget.model = child
                }
            })
        }
    }

    setupScenery (scene: Scene) {
        if (this.animation && this.animation.animationTool.model && this.animation.animationTarget.model) {
            EventBus.emit(GLEvents.HIGHLIGHT_MANAGER_REQUIRED, true)

            scene.animationMixer = new AnimationMixer(this.model.scene)

            this.animation.action = scene.animationMixer.clipAction(this.animation.clip)
            this.animation.action.setLoop(LoopOnce, 1)

            // NOTE : We indicate that scissors are an interactive & draggable object$
            if (scene.draggableObjects.length) {
                scene.draggableObjects.shift()
            }
            scene.draggableObjects.push(this.animation.animationTool.model) // Draggable
            scene.dragControls.transformGroup = true

            scene.dragControls.addEventListener('dragstart', (e) => {
                this.animation!.onDragStart(scene)
            })
            scene.dragControls.addEventListener('dragend', (e) => {
                this.animation!.onDragEnd(scene)
            })

            scene.interactionManager.add(this.animation.animationTarget.model)
        } else {
            console.error("Tool or Target undefined")
        }
    }
}

export default PlanetScenery
