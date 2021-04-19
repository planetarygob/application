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
    Scene,
    WebGLCubeRenderTarget
} from 'three'
import vertexShader from '../shaders/Bubble/vertex'
import fragmentShader from '../shaders/Bubble/fragment'
import GUI from '../../utils/dev/GUI'
import EventBus from '../../utils/EventBus'
import { GLEvents } from '../../utils/GLEvents'
import Renderer from '../core/Renderer'
import BubbleCamera from './BubbleCamera'

class Bubble extends Object3D {

    renderer: Renderer
    scene: Scene
    bubbleCamera?: CubeCamera

    shader: any
    mesh: Mesh

    hdrCubeRenderTarget: any
    hdrEquirect: any

    constructor(
        radius: number, 
        detail: number,
        scene: Scene,
        renderer: Renderer,
    ) {
        super()

        this.scene = scene
        this.renderer = renderer

        this.userData = {
            speed: 0.3,
            density: 0.3,
            strength: 0.2
        }

        this.GUI()

        this.addCubeCamera()
        const geometry = new IcosahedronGeometry( radius, detail )
        this.mesh = new Mesh(geometry, this.generateMaterial())

        EventBus.on(GLEvents.UPDATE, (e: any) => this.update(e.elapsedTime))
    }

    // ---------------- INITIALIZATION

    GUI() {
        const bubbleFolder = GUI.addFolder('Bubble')
        bubbleFolder.add(this.userData, 'speed', 0, 2.5, 0.1)
        bubbleFolder.add(this.userData, 'density', 0, 2.5, 0.1)
        bubbleFolder.add(this.userData, 'strength', 0, 2.5, 0.1)
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

    generateMaterial(): MeshPhysicalMaterial {

        const bubbleTexture = new CanvasTexture( this.generateTexture() )
        bubbleTexture.repeat.set(1, 0)

        const material = new MeshPhysicalMaterial ({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            alphaMap: bubbleTexture,
            alphaTest: 0.5,
            envMap: this.hdrCubeRenderTarget.texture,
            envMapIntensity: 8,
            depthWrite: false,
            transmission: 0.9,
            opacity: 1,
            transparent: true,
            side: BackSide
        })

        material.onBeforeCompile = (shader) => {
            shader.uniforms = {
                ...shader.uniforms,
                uTime: { value: 0 },
                uSpeed: { value: this.userData.speed },
                uNoiseDensity: { value: this.userData.density },
                uNoiseStrength: { value: this.userData.strength }
            }

            shader.vertexShader = vertexShader
            shader.fragmentShader = fragmentShader

            this.shader = shader
        }

        return material
    }

    addCubeCamera() {
        const cubeRenderTarget = new WebGLCubeRenderTarget( 5, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter } )

        const pmremGenerator = new PMREMGenerator( this.renderer )
        this.hdrCubeRenderTarget = pmremGenerator.fromScene( this.scene )

        // TODO : 30 is worldSize
        this.bubbleCamera = new BubbleCamera( 1, 30, cubeRenderTarget, this.renderer, this.scene )
        this.add( this.bubbleCamera )
    }

    // ---------------- LIFECYCLE

    update(elapsedTime: number) {
        if ( this.shader ) {
            this.shader.uniforms.uTime.value = elapsedTime
            this.shader.uniforms.uSpeed.value = this.userData.speed
            this.shader.uniforms.uNoiseDensity.value = this.userData.density
            this.shader.uniforms.uNoiseStrength.value = this.userData.strength
        }
    }
}

export default Bubble
