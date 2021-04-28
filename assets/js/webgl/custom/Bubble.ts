import { 
    BackSide,
    CanvasTexture,
    CubeCamera,
    IcosahedronGeometry, 
    LinearMipmapLinearFilter, 
    Mesh,
    MeshPhysicalMaterial, 
    Object3D, 
    PMREMGenerator,
    RGBFormat,
    WebGLCubeRenderTarget,
    WebGLRenderTarget
} from 'three'
import vertexShader from '../shaders/Bubble/vertex'
import fragmentShader from '../shaders/Bubble/fragment'
import EventBus from '../../utils/EventBus'
import { GLEvents } from '../../utils/Events'
import Renderer from '../core/Renderer'
import BubbleCamera from './BubbleCamera'
import { BubbleData } from '../data/BubbleData'
import Scene from '../core/Scene'
import { getRandomIntInclusive } from '../../utils/Math'

class Bubble extends Object3D {

    radius: number
    detail: number
    renderer: Renderer
    scene: Scene
    
    mesh: any
    shader: any
    oldShader: any

    bubbleCamera?: CubeCamera
    hdrCubeRenderTarget?: WebGLRenderTarget

    constructor(
        radius: number, 
        detail: number,
        scene: Scene,
        renderer: Renderer,
    ) {
        super()

        this.radius = radius
        this.detail = detail
        this.renderer = renderer
        this.scene = scene

        this.generateCubeCamera()
        
        // NOTE : Use Point Particles for explosion animation might be an option
        this.mesh = new Mesh(this.generateGeometry(), this.generateMaterial())

        // NOTE : We set bubbles on a different layer, only visible to main PerspectiveCamera to avoid infinite light reflection on envMap from CubeCameras
        this.mesh.layers.set( 1 )

        EventBus.on(GLEvents.UPDATE, (e: any) => this.update(e.elapsedTime))
    }

    // ---------------- METHODS

    generateTexture(): HTMLCanvasElement {
        const canvas = document.createElement("canvas") as HTMLCanvasElement
        canvas.width = 2
        canvas.height = 2
      
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        context.fillStyle = "white"
        context.fillRect( 0, 1, 2, 1 )
      
        return canvas
    }

    generateGeometry(): IcosahedronGeometry {
        const geometry = new IcosahedronGeometry( this.radius, this.detail )

        return geometry
    }

    // TODO : Seems like several instance of Bubble have the same envMap
    generateMaterial(): MeshPhysicalMaterial {
        const bubbleTexture = new CanvasTexture( this.generateTexture() )
        bubbleTexture.repeat.set( 1, 0 )

        const material = new MeshPhysicalMaterial ({
            color: BubbleData.color,
            metalness: 0,
            roughness: 0,
            alphaMap: bubbleTexture,
            alphaTest: 0.5,
            envMap: this.hdrCubeRenderTarget!.texture,
            envMapIntensity: BubbleData.envMapIntensity,
            depthWrite: false,
            transmission: BubbleData.transmission,
            opacity: 1,
            transparent: true,
            side: BackSide
        })

        material.onBeforeCompile = ( shader ) => {
            shader.uniforms = {
                ...shader.uniforms,
                uTime: { value: 0 },
                uSpeed: { value: BubbleData.speed + getRandomIntInclusive(-0.5, 0.5) },
                uNoiseDensity: { value: BubbleData.density },
                uNoiseStrength: { value: BubbleData.strength }
            }

            shader.vertexShader = vertexShader
            shader.fragmentShader = fragmentShader

            this.oldShader = this.shader
            this.shader = shader
        }

        return material
    }

    generateCubeCamera() {
        const cubeRenderTarget = new WebGLCubeRenderTarget( 5, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter } )

        const pmremGenerator = new PMREMGenerator( this.renderer )
        this.hdrCubeRenderTarget = pmremGenerator.fromScene( this.scene )
        pmremGenerator.dispose()

        // TODO : 30 is worldSize
        this.bubbleCamera = new BubbleCamera( 1, 30, cubeRenderTarget, this.renderer, this.scene )
        this.add( this.bubbleCamera )
    }

    // ---------------- LIFECYCLE

    update( elapsedTime: number ) {
        if ( this.shader ) {
            this.shader.uniforms.uTime.value = elapsedTime
            this.shader.uniforms.uSpeed.value = BubbleData.speed + getRandomIntInclusive(-0.5, 0.5)
            this.shader.uniforms.uNoiseDensity.value = BubbleData.density
            this.shader.uniforms.uNoiseStrength.value = BubbleData.strength
            this.mesh.material.transmission = BubbleData.transmission
            this.mesh.material.envMapIntensity = BubbleData.envMapIntensity

            // TODO : Fix color change, seems to only work for extreme RGB colors
            this.mesh.material.color = BubbleData.color
        }
    }
}

export default Bubble
