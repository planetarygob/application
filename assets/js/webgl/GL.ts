import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Controls from './core/Controls'
import { 
    Clock,
    DirectionalLight,
    AnimationMixer,
    AmbientLight
} from 'three'
import Stats from '../utils/dev/Stats'
import CustomInteractionManager from '../utils/managers/CustomInteractionManager'
import HighlightManager from '../utils/managers/HighlightManager'
import { CustomLoadingManager } from '../utils/managers/CustomLoadingManager'
import Bubble from './custom/Bubble'
import Sky from './custom/Sky'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/Events'
import GUI from '../utils/dev/GUI'
import { initGUI } from '../utils/dev/GUIFolders'
import Planet from './custom/Planet'
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
    scene: Scene
    clock: Clock
    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    loadingManager: CustomLoadingManager
    mixer: AnimationMixer|null
    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any
    cubeRenderTarget: any
    size: Size
    canvas: HTMLCanvasElement
    isInteractionManagerRequired: boolean

    constructor() {
        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)
        initGUI()

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

        this.scene = new Scene(this.canvas, this.size)

        this.isInteractionManagerRequired = false

        // this.clock = new Clock()

        // this.mixer = null

        // EventBusManager.getInstance().emitter.on('gl:needClock', function needClock (e: any) {
        //     self.clock = new Clock()
        //     EventBusManager.getInstance().emitter.off('gl:needClock', needClock)
        // })

        // this.loadingManager = new CustomLoadingManager(this.renderer, this.scene)

        // this.interactionManager = new CustomInteractionManager(this.renderer, this.scene.camera)

        // this.highlightManager = new HighlightManager(this.renderer, this.scene, this.scene.camera)

        // EventBusManager.getInstance().emitter.on('gl:needSphereCamera', (e: any) => {
        //     this.cubeRenderTarget = new WebGLCubeRenderTarget(5, {format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter})
        //     this.sphereCamera = new CubeCamera(1, 30, this.cubeRenderTarget)
        //     this.scene.add(this.sphereCamera)
        // })

        this.listenEvents()

        this.animate()
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL();
        }
 
        return GL.instance;
    }

    // ---------------- METHODS

    listenEvents() {
        window.addEventListener('resize', this.resize.bind(this))
        EventBus.on<boolean>(GLEvents.UPDATE_INTERACTION_MANAGER, (required) => {
            if (required !== undefined) {
                this.isInteractionManagerRequired = required
            }
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;

        this.scene.camera.aspect = this.size.width / this.size.height
        this.scene.renderer.setSize(this.size.width, this.size.height)

        this.scene.camera.updateProjectionMatrix()
    }

    // ---------------- LIFECYCLE
    // TODO : Rework so that we're not dependent of the user's framerate

    animate() {
        Stats.begin()

        window.requestAnimationFrame(this.animate.bind(this))
        this.render()

        Stats.end()
    }

    render() {
        // controls update useless?
        // this.controls.update()

        // interactionManager couteux
        if (this.isInteractionManagerRequired) {
            CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera).update()
        }

        if (this.clock) {
            EventBus.emit(GLEvents.UPDATE, {
                elapsedTime: this.clock.getElapsedTime() 
            })
            if (this.mixer) {
                this.mixer.update(this.clock.getDelta())
            }
        }

        // Tracker.update(this.renderer.render)

        this.scene.renderer.render(this.scene, this.scene.camera)

        if (this.highlightManager) {
            // console.log('higlight update');
            // this.highlightManager.render();
        }
        
        if (this.sphereCamera) {
            console.log('sphere camera update');
            this.sphereCamera.update(this.scene.renderer, this.scene)
        }

    }
}

export default GL