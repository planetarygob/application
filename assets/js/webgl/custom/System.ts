import { Group, Vector3 } from "three"
import Planet from "./Planet"
import Sun from "./Sun"
import { CustomLoadingManager } from "../../utils/managers/CustomLoadingManager"
import GL from "../GL"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

class System extends Group {
    name: string
    initialPosition: Vector3
    title: string
    description: string
    navPosition: number
    isSelected: boolean
    loadingManager: CustomLoadingManager

    constructor(
        name: string,
        initialPosition: Vector3,
        title: string,
        description: string,
        navPosition: number
    ) {
        super()

        this.name = name
        this.initialPosition = initialPosition
        this.title = title
        this.description = description
        this.navPosition = navPosition

        this.isSelected = false 

        this.position.set(0, 0, 0)
        this.scale.set(1, 1, 1)

        const gl = GL.getInstance()

        this.loadingManager = CustomLoadingManager.getInstance(gl.scene.renderer, gl.scene)
        const systemInfos = this.loadingManager.getGLTFInfos(this.name)

        this.createSun(systemInfos)
        this.createPlanets(systemInfos, gl)
    }

    createSun (systemInfos: any) {
        // system always have a sun
        const sunInfos = systemInfos.sun
        const sunModel = this.loadingManager.getGLTFByName(sunInfos.name)

        const sun = new Sun(sunInfos.name, sunModel)
        this.add(sun)
    }

    createPlanets (systemInfos: any,gl: GL) { 
        if (!systemInfos.hasOwnProperty('planets')) {
            return
        }

        for (let planetInfos of systemInfos.planets) {
            let objectModel: GLTF|undefined
            let sceneryModel: GLTF|undefined
            let ySceneryPosition: number = 0
            let sceneryAnimationTool: string = ""
            let sceneryAnimationTarget: string = ""

            if (planetInfos.hasOwnProperty('object')) {
                objectModel = this.loadingManager.getGLTFByName(planetInfos.object.name)
            }
            if (planetInfos.hasOwnProperty('scenery')) {
                sceneryModel = this.loadingManager.getGLTFByName(planetInfos.scenery.name)
                ySceneryPosition = planetInfos.scenery.yPosition
                sceneryAnimationTool = planetInfos.scenery.interaction.tool
                sceneryAnimationTarget = planetInfos.scenery.interaction.target
            }

            const planet = new Planet(gl.scene, planetInfos.name, objectModel, sceneryModel, planetInfos.initialPosition, ySceneryPosition, sceneryAnimationTool, sceneryAnimationTarget)
            this.add(planet)
        }  
    }

    triggerSun (visible: boolean) {
        const sun = this.children[0]
        sun.visible = visible
    }
}

export default System
