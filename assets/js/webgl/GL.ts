import Scene from './core/Scene'
import Renderer from './core/Renderer'
import { 
    PerspectiveCamera,
    Clock,
    AmbientLight,
    DirectionalLight,
    PointsMaterial,
    BufferGeometry,
    BufferAttribute,
    Points,
    AnimationMixer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import Proton from 'three.proton.js';
import EventBusManager from '../utils/EventBus'
import CustomInteractionManager from '../utils/managers/CustomInteractionManager'
import HighlightManager from '../utils/managers/HighlightManager'
import { CustomLoadingManager } from '../utils/managers/CustomLoadingManager'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

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
    controls: OrbitControls
    clock: Clock
    size: Size
    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    loadingManager: CustomLoadingManager
    proton: Proton
    mixer: AnimationMixer
    model: Object3D
    model2: Object3D
    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any
    cubeRenderTarget: any

    constructor() {

        let self = this 

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

        this.camera = new PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.set(0, 10, -15)

        this.controls = new OrbitControls(this.camera, this.canvas)

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

        const ambientLight = new AmbientLight(0xffffff, 0.8)
        this.scene.add(ambientLight)

        const directionalLight = new DirectionalLight(0xffffff, 1)
        directionalLight.position.set(0, 5, -5)
        this.scene.add(directionalLight)

        this.addBackgroundParticles()
    }

    addEvents() {
        window.addEventListener('resize', this.resize.bind(this))
        // window.addEventListener('click', this.scene.trigger)
    }  

    addBackgroundParticles () {
        const particlesMaterial = new PointsMaterial({
            size: 0.02,
            sizeAttenuation: true
        })
        const particlesGeometry = new BufferGeometry()
        const count = 2000

        const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)

        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100 // Math.random() - 0.5 to have a random value between -0.5 and +0.5
        }

        particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3))
        const particles = new Points(particlesGeometry, particlesMaterial)
        this.scene.add(particles)
    }
    
    resize() {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setSize(this.size.width, this.size.height)

        this.camera.updateProjectionMatrix()
    }

    generateTexture() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement
        canvas.width = 2
        canvas.height = 2
      
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        context.fillStyle = "white"
        context.fillRect(0, 1, 2, 1)
      
        return canvas
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

        if (this.clock) {
            elapsedTime = this.clock.getElapsedTime()
        }

        if (this.model && this.model2) {
            const modelAngle = elapsedTime * 2
            this.model.position.y = Math.sin(modelAngle) / 6
    
            const modelAngle2 = elapsedTime * 4
            this.model2.position.y = Math.sin(modelAngle2) / 6
        }

        if (this.mixer) {
            let deltaTime = 0
            deltaTime = elapsedTime - previousTime
            previousTime = elapsedTime

            this.mixer.update(deltaTime)
        }

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