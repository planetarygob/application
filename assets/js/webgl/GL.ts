import Scene from './core/Scene'
import Renderer from './core/Renderer'
import { 
    PerspectiveCamera,
    Clock
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Bubble from './custom/Bubble'


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
    bubble: Bubble

    constructor() {
        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.z = 5

        this.controls = new OrbitControls(this.camera, this.canvas)
        this.clock = new Clock()
        this.renderer = new Renderer({ canvas: this.canvas })

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

    init() {
        if (this.canvas) {
            this.canvas.width = this.size.width
            this.canvas.height = this.size.height
        } else {
            console.log("No canvas")
        }

        this.addElements()
        this.addEvents()

        this.scene.add(this.camera)

        this.controls.enableDamping = true

        this.renderer.setSize(this.size.width, this.size.height)
        this.renderer.render(this.scene, this.camera)
    }

    addElements() {
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

    animate() {
        window.requestAnimationFrame(this.animate.bind(this))
        this.render()
    }

    render() {
        this.controls.update()

        this.bubble.render(this.clock.getElapsedTime())

        this.renderer.render(this.scene, this.camera)
    }
}

export default GL