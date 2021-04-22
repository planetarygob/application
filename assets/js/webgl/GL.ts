import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Controls from './core/Controls'
import { 
    PerspectiveCamera,
    Clock,
    DirectionalLight,
    AnimationMixer,
    AmbientLight
} from 'three'
import Stats from 'stats.js'
import Proton from 'three.proton.js';
import CustomInteractionManager from '../utils/managers/CustomInteractionManager'
import HighlightManager from '../utils/managers/HighlightManager'
import { CustomLoadingManager } from '../utils/managers/CustomLoadingManager'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import Tracker from '../utils/dev/Tracker'
import Bubble from './custom/Bubble'
import Sky from './custom/Sky'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/GLEvents'
import Camera from './core/Camera'

let previousTime = 0
let elapsedTime = 0


interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    stats: Stats
    canvas: HTMLCanvasElement
    scene: Scene 
    renderer: Renderer 
    camera: PerspectiveCamera
    controls: Controls
    clock: Clock
    size: Size
    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    loadingManager: CustomLoadingManager
    proton: Proton
    mixer: AnimationMixer
    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any
    cubeRenderTarget: any

    constructor() {
        this.stats = new Stats()
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom)

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement
        if (this.canvas) {
            this.canvas.width = this.size.width
            this.canvas.height = this.size.height
        } else {
            console.log("No canvas")
        }

        this.scene = new Scene()

        this.camera = new Camera(75, this.size.width / this.size.height, 0.1, 1000)

        this.controls = new Controls(this.camera, this.canvas)
        

        this.clock = new Clock()

        // EventBusManager.getInstance().emitter.on('gl:needClock', function needClock (e: any) {
        //     self.clock = new Clock()
        //     EventBusManager.getInstance().emitter.off('gl:needClock', needClock)
        // })

        this.renderer = new Renderer({ canvas: this.canvas }, this.size.width, this.size.height)
        this.renderer.render(this.scene, this.camera)

        this.loadingManager = new CustomLoadingManager(this.renderer, this.scene)

        this.interactionManager = new CustomInteractionManager(this.renderer, this.camera)

        this.highlightManager = new HighlightManager(this.renderer, this.scene, this.camera)

        // EventBusManager.getInstance().emitter.on('gl:needProton', (e: any) => {
        //     this.proton = new Proton()
        // })

        // EventBusManager.getInstance().emitter.on('gl:needSphereCamera', (e: any) => {
        //     this.cubeRenderTarget = new WebGLCubeRenderTarget(5, {format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter})
        //     this.sphereCamera = new CubeCamera(1, 30, this.cubeRenderTarget)
        //     this.scene.add(this.sphereCamera)
        // })

        this.addElements()
        this.addEvents()

        this.animate();    
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL();
        }
 
        return GL.instance;
    }

    // ---------------- METHODS

    addElements() {
        this.scene.add(this.camera)

        // const ambientLight = new AmbientLight(0xffffff, 0.8)
        // this.scene.add(ambientLight)

        // const boxGeometry = new TorusKnotBufferGeometry( 1, 1, 5, 32 );
        // const boxMaterial = new MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        // const box2 = new Mesh( boxGeometry, boxMaterial )
        // this.scene.add( box2 )
        // box2.position.x = 10
        // const box3 = new Mesh( boxGeometry, boxMaterial )
        // this.scene.add( box3 )
        // box3.position.x = -10

        // const bubble = new Bubble( 1, 12, this.scene, this.renderer )
        // this.scene.add( bubble.mesh )

        // const sky = new Sky( this.canvas.width, this.canvas.height )
        // this.scene.add( sky.mesh )

        // this.createLights()
    }

    addEvents() {
        window.addEventListener( 'resize', this.resize.bind(this) )
        this.controls.addEventListener('change', () => {
            EventBus.emit(GLEvents.UPDATE_CUBE_CAMERA)
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setSize(this.size.width, this.size.height)

        this.camera.updateProjectionMatrix()
    }

    createLights() {
        const ambientLight = new AmbientLight(0xaa54f0, 1)
      
        const directionalLight1 = new DirectionalLight(0xffffff, 1)
        directionalLight1.position.set(-2, 2, 5)
      
        const directionalLight2 = new DirectionalLight(0xfff000, 1)
        directionalLight2.position.set(-2, 4, 4)
        directionalLight2.castShadow = true
      
        this.scene.add(ambientLight, directionalLight1, directionalLight2)
    }

    // ---------------- LIFECYCLE

    animate() {
        this.stats.begin()

        window.requestAnimationFrame(this.animate.bind(this))
        this.render()

        this.stats.end()
    }

    render() {
        // controls update useless?
        // this.controls.update()

        // interactionManager couteux
        if (this.interactionManager) {
            this.interactionManager.update()
        }
        
        if (this.proton) {
            // console.log('proton update');
            this.proton.update()
        }

        if (this.mixer && this.clock) {    
            this.mixer.update(this.clock.getDelta())
        }

        // Tracker.update(this.renderer.render)

        this.renderer.render(this.scene, this.camera)


        if (this.highlightManager) {
            this.highlightManager.render();
        }
        
        if (this.sphereCamera) {
            this.sphereCamera.update(this.renderer, this.scene)
        }

    }
}

export default GL