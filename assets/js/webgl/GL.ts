import Scene from './core/Scene'
import Renderer from './core/Renderer'
import { 
    PerspectiveCamera,
    Clock
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Bubble from './custom/Bubble'
import Stats from 'stats.js'


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
    bubble: Bubble

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

        this.camera = new PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.z = 5

        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        this.clock = new Clock()

        this.renderer = new Renderer({ canvas: this.canvas })
        this.renderer.setSize(this.size.width, this.size.height)
        this.renderer.render(this.scene, this.camera)

        this.bubble = new Bubble(1, 64)
        
        this.init();
        this.animate();    
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL();
        }
 
        return GL.instance;
    }

    // ---------------- METHODS

    init() {
        this.addElements()
        this.addEvents()
    }

    addElements() {
        this.scene.add(this.camera)
        this.scene.add(this.bubble.mesh)
    }

    addEvents() {
        window.addEventListener('resize', this.resize.bind(this))
    }  
    
    resize() {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setSize(this.size.width, this.size.height)

        this.camera.updateProjectionMatrix()
    }

    // ---------------- LIFECYCLE

    animate() {
        this.stats.begin()

        window.requestAnimationFrame(this.animate.bind(this))
        this.render()

        this.stats.end()
    }

    render() {
        this.controls.update()

        this.bubble.update(this.clock.getElapsedTime())

        this.renderer.render(this.scene, this.camera)
    }
}

export default GL