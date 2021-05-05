import { Group, Vector3 } from "three"
import Planet from "./Planet"
import Sun from "./Sun"
import { CustomLoadingManager } from "../../utils/managers/CustomLoadingManager"
import GL from "../GL"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import PlanetObject from "./PlanetObject"
import PlanetScenery from "./PlanetScenery"
import SceneryInteraction from "./SceneryInteraction"
import AnimationObject from "./AnimationObject"
import GLTFAnimation from "./GLTFAnimation"

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

        this.loadingManager = CustomLoadingManager.getInstance(gl.scene.renderer)
        const systemInfos = this.loadingManager.getGLTFInfos(this.name)

        this.createSun(systemInfos)
        this.createPlanets(systemInfos, gl)
    }

    createSun (systemInfos: any) {
        // system always have a sun
        const sunInfos = systemInfos.sun
        const sunModel = this.loadingManager.getGLTFByName(sunInfos.name)

        const sun = new Sun(sunInfos.name, sunModel, sunInfos.floatFactor)
        this.add(sun)
    }

    createPlanets (systemInfos: any, gl: GL) {
        if (!systemInfos.hasOwnProperty('planets')) {
            return
        }

        for (let planetInfos of systemInfos.planets) {
            let object: PlanetObject|undefined
            let scenery: PlanetScenery|undefined

            if (planetInfos.hasOwnProperty('object')) {
                const objectModel = this.loadingManager.getGLTFByName(planetInfos.object.name)
                object = new PlanetObject(planetInfos.object.name, objectModel)
            }

            if (planetInfos.hasOwnProperty('scenery')) {
                const sceneryModel = this.loadingManager.getGLTFByName(planetInfos.scenery.name)
                const animationTool = new AnimationObject(planetInfos.scenery.interaction.tool, null)
                const animationTarget = new AnimationObject(planetInfos.scenery.interaction.target, null)
                let animation: GLTFAnimation|null = null
                if (sceneryModel.animations.length) {
                    animation = new GLTFAnimation(null, sceneryModel.animations[0], null, null, animationTool, animationTarget)
                }
                
                scenery = new PlanetScenery(planetInfos.scenery.name, sceneryModel, planetInfos.scenery.yPosition, animation)
            }

            const planet = new Planet(gl.scene, this.name, object, scenery, planetInfos)

            this.add(planet)
        }  
    }

    triggerSun (visible: boolean) {
        const sun = this.children[0]
        sun.visible = visible
    }
}

export default System
