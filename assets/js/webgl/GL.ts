import { 
    PerspectiveCamera,
    Clock,
    CanvasTexture,
    SphereGeometry,
    MeshBasicMaterial,
    BackSide,
    Mesh
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Bubble from './custom/Bubble'
import Stats from '../utils/Stats'
import EventBus from '../utils/EventBus'
import Sky from './custom/Sky'
import SkyTexture from './textures/SkyTexture'
import { GLEvents } from '../utils/GLEvents'


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

        // TODO : 
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

        // TODO : Should not be here at the end, shoudl rather be in Scene.ts
        const bubble = new Bubble( 1, 32 )
        const sky = new Sky( this.canvas.width, this.canvas.height )

        this.scene.add( sky.mesh )
        this.scene.add( bubble.mesh )
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

    // ---------------- LIFECYCLE

    animate() {
        Stats.update()

        window.requestAnimationFrame( this.animate.bind(this) )
        this.render()
    }

    render() {
        const elapsedTime = this.clock.getElapsedTime()
        this.controls.update()
        
        // TODO : Print dans un élément d'UI
        // console.log( this.renderer.info )

        EventBus.emit(GLEvents.UPDATE, { elapsedTime: elapsedTime })

        this.renderer.render(this.scene, this.camera)
    }
}

export default GL