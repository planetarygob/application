import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import GLTFAnimation from './GLTFAnimation'
import Scene from "../core/Scene"
import EventBus from "../../utils/EventBus"
import { GLEvents, UIEvents } from "../../utils/Events"
import { AnimationMixer, LoopOnce, Vector3, Object3D, Group, DirectionalLight, AmbientLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshLambertMaterial } from "three"
import SceneryCharacter from "./SceneryCharacter"
import SceneryLogo from "./SceneryLogo"

class PlanetScenery extends Group {
    name: string
    model: GLTF
    yPosition: number
    animation: GLTFAnimation|null
    character: SceneryCharacter|null
    logo: SceneryLogo|null
    hiddenObjects: Array<Object3D>

    constructor (
        name: string,
        model: GLTF,
        yPosition: number,
        animation: GLTFAnimation|null,
        character: SceneryCharacter|null,
        logo: SceneryLogo|null
    ) {
        super()

        this.name = name
        this.model = model
        this.yPosition = yPosition
        this.animation = animation
        this.character = character
        this.logo = logo

        this.model.scene.visible = false
        this.model.scene.scale.set(0.005, 0.005, 0.005)

        this.hiddenObjects = []

        this.model.scene.traverse((child: any) => {
            if (child instanceof Mesh) {
                const prevMaterial = child.material
                const newMaterial = new MeshBasicMaterial()
                newMaterial.copy(prevMaterial)
                newMaterial.map = prevMaterial.emissiveMap // Dans le cas ou il n'y a rien dans la propriété map
                child.material = newMaterial
            }

            if (child.name === 'Logo_RS') {
                child.visible = false
            }

            if (this.animation) {
                if (child.name === this.animation!.animationTool.name) {
                    this.animation!.animationTool.model = child
                    console.log('this.animation!.animationTool', this.animation!.animationTool);
                }
                if (child.name === this.animation!.animationTarget.name) {
                    this.animation!.animationTarget.model = child
                }

                if (child.name === 'explosion_fleurs' || child.name === 'flowergun' || child.name === 'flowerbandana') {
                    this.hiddenObjects.push(child)
                }
            }
        })

        if (this.name === 'mode_scenery_rock' && this.animation) {
            this.character!.model.scene.traverse((child: any) => {
                if (child.name === this.animation!.animationTarget.name) {
                    this.animation!.animationTarget.model = child
                }
            })
            console.log('this.animation!.animationTarget', this.animation!.animationTarget);
        }

        if (this.name === 'mode_scenery_hippie' && this.animation) {
            this.character!.model.scene.traverse((child: any) => {
                if (child.name === this.animation!.animationTool.name) {
                    this.animation!.animationTool.model = child
                }
                if (child.name === this.animation!.animationTarget.name) {
                    this.animation!.animationTarget.model = child
                }
            })
        }

        for (let object of this.hiddenObjects) {
            object.visible = false
        }
    }

    setupSceneryInteraction (scene: Scene) {
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

            const initialScale = new Vector3(
                this.animation.animationTool.model.scale.x + 0.002,
                this.animation.animationTool.model.scale.y + 0.002,
                this.animation.animationTool.model.scale.z + 0.002)

            EventBus.on<number>(GLEvents.UPDATE_TOOL_SCALE, (elapsedTime) => {
                if (elapsedTime !== undefined) {
                    this.animation!.updateToolScaleAnimation(elapsedTime, initialScale)
                }
            })

            // if (this.name === 'mode_scenery_rock' && this.animation) {
            //     this.animation!.animationTarget.model = this.character!.model.scene
            //     this.animation?.launchAnimation(scene)
            //     console.log('this.animation!.animationTarget', this.animation!.animationTarget);
            // }

            scene.dragControls.activate()

            // TODO: custom cursor
            scene.dragControls.addEventListener('hoveron', (e) => {
                setTimeout(() => {
                    scene.renderer.domElement.style.cursor = 'grab'
                }, 1)
            })

            scene.dragControls.addEventListener('hoveroff', (e) => {
                scene.renderer.domElement.style.cursor = 'default'
            })

            scene.dragControls.addEventListener('dragstart', (e) => {
                setTimeout(() => {
                    scene.renderer.domElement.style.cursor = 'grabbing'
                }, 1)
                this.animation!.onDragStart(scene)
            })

            scene.dragControls.addEventListener('dragend', (e) => {
                this.animation!.onDragEnd(scene, this.hiddenObjects)
            })

            scene.highlightManager.add(this.animation.animationTool.model)
            scene.interactionManager.add(this.animation.animationTarget.model)
            scene.interactionManager.add(this.animation.animationTool.model)
        } else {
            console.error("Tool or Target undefined")
        }
    }
}

export default PlanetScenery
