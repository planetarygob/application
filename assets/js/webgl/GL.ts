import { 
    PerspectiveCamera,
    Clock,
    CanvasTexture,
    SphereGeometry,
    MeshBasicMaterial,
    BackSide,
    Mesh,
    WebGLCubeRenderTarget,
    RGBFormat,
    LinearMipmapLinearFilter,
    CubeCamera,
    MeshLambertMaterial,
    Color,
    CubeTextureLoader,
    BoxBufferGeometry,
    MeshPhysicalMaterial,
    PMREMGenerator,
    UnsignedByteType,
    SphereBufferGeometry,
    DirectionalLight,
    AmbientLight,
    TorusKnotGeometry
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Bubble from './custom/Bubble'
import Stats from '../utils/Stats'
import EventBus from '../utils/EventBus'
import Sky from './custom/Sky'
import SkyTexture from './textures/SkyTexture'
import { GLEvents } from '../utils/GLEvents'
import Tracker from '../utils/Tracker'


interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    canvas: HTMLCanvasElement
    scene: Scene 
    renderer: Renderer 
    camera: PerspectiveCamera
    controls: OrbitControls
    clock: Clock
    size: Size

    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any

    constructor() {
        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement
        if (this.canvas) {
            this.canvas.width = this.size.width
            this.canvas.height = this.size.height
        }

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(45, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.z = 5

        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        this.clock = new Clock()

        this.renderer = new Renderer({ 
                canvas: this.canvas,
                alpha: false,
                antialiasing: true
            }, 
            this.size.width, 
            this.size.height
        )
        this.renderer.render(this.scene, this.camera)

        this.addElements()
        this.addEvents()

        this.animate()
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL()
        }
 
        return GL.instance
    }

    // ---------------- METHODS

    addElements() {
        this.scene.add( this.camera )

        // TODO : Should not be here at the end, should rather be in Scene.ts

        const bubble = new Bubble( 1, 12 )
        // this.scene.add( bubble.mesh )

        const sky = new Sky( this.canvas.width, this.canvas.height )
        this.scene.add( sky.mesh )

        const cubeRenderTarget = new WebGLCubeRenderTarget( 5, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter } )

        // TODO : 30 is worldSize
        this.sphereCamera = new CubeCamera( 1, 30, cubeRenderTarget )
        this.scene.add( this.sphereCamera )

        const boxGeometry = new TorusKnotGeometry( 1, 1, 5, 32 );
        const boxMaterial = new MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        const box = new Mesh( boxGeometry, boxMaterial )
        this.scene.add( box )
        const box2 = new Mesh( boxGeometry, boxMaterial )
        this.scene.add( box2 )
        box2.position.x = 10
        const box3 = new Mesh( boxGeometry, boxMaterial )
        this.scene.add( box3 )
        box3.position.x = -10

        const pmremGenerator = new PMREMGenerator( this.renderer )
        this.hdrCubeRenderTarget = pmremGenerator.fromScene(this.scene)

        // Raw texture of scene used as gradient
        const sphereMaterial = new MeshBasicMaterial( { envMap: cubeRenderTarget.texture } )

        const bubbleTexture = new CanvasTexture(this.generateTexture());
        bubbleTexture.repeat.set(1, 0);
        
        const bubbleMaterial = new MeshPhysicalMaterial ({
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
            transparent: true
        })

        const bubbleMaterial1b = bubbleMaterial.clone()
        bubbleMaterial1b.side = BackSide

        const bubbleGeometry1 = new SphereBufferGeometry(3, 64, 32);

        // const sphere = new Mesh( bubbleGeometry1, bubbleMaterial1b )
        const sphere = new Mesh( bubbleGeometry1, bubbleMaterial1b )
        this.scene.add( sphere )

        this.createLights()
    }

    addEvents() {
        window.addEventListener( 'resize', this.resize.bind(this) )
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( this.size.width, this.size.height )

        this.camera.updateProjectionMatrix()
    }

    generateTexture() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement
        canvas.width = 2;
        canvas.height = 2;
      
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        context.fillStyle = "white";
        context.fillRect(0, 1, 2, 1);
      
        return canvas;
    };

    createLights() {
        const ambientLight = new AmbientLight(0xaa54f0, 1);
      
        const directionalLight1 = new DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(-2, 2, 5);
      
        const directionalLight2 = new DirectionalLight(0xfff000, 1);
        directionalLight2.position.set(-2, 4, 4);
        directionalLight2.castShadow = true;
      
        this.scene.add(ambientLight, directionalLight1, directionalLight2);
    };

    // ---------------- LIFECYCLE

    animate() {
        Stats.update()

        window.requestAnimationFrame( this.animate.bind(this) )

        this.render()
    }

    render() {
        const elapsedTime = this.clock.getElapsedTime()

        this.controls.update()

        Tracker.update( this.renderer.info.render )
        EventBus.emit(GLEvents.UPDATE, { elapsedTime: elapsedTime })

        this.renderer.render( this.scene, this.camera )
        this.sphereCamera.update( this.renderer, this.scene )
    }
}

export default GL