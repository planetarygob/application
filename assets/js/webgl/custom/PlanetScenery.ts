import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import SceneryInteraction from "./SceneryInteraction"

class PlanetScenery {
    name: string
    model: GLTF
    yPosition: number
    interaction: SceneryInteraction

    constructor (
        name: string,
        model: GLTF,
        yPosition: number,
        interaction: SceneryInteraction
    ) { 
        this.name = name
        this.model = model
        this.yPosition = yPosition
        this.interaction = interaction

        this.model.scene.visible = false
        this.model.scene.position.y = this.yPosition
        this.model.scene.scale.set(0.005, 0.005, 0.005)

        this.model.scene.traverse((child: any) => {
            if (child.name === this.interaction.animationTool.name) {
                this.interaction.animationTool.model = child
            }
            if (child.name === this.interaction.animationTarget.name) {
                this.interaction.animationTarget.model = child
            }
        })
    }
}

export default PlanetScenery
