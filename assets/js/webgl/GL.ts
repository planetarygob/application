import Scene from './core/Scene'
import { 
    Clock
} from 'three'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/Events'
import { initGUI } from '../utils/dev/GUIFolders'
import Tracker from '../utils/dev/Tracker'

interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    scene: Scene
    clock: Clock
    size: Size
    canvas: HTMLCanvasElement
    isAnimationMixerRequired: boolean

    constructor() {
        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.scene = new Scene(this.canvas, this.size)

        this.clock = new Clock()

        this.isAnimationMixerRequired = false

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
        EventBus.on<boolean>(GLEvents.ANIMATION_MIXER_REQUIRED, (required) => {
            if (required !== undefined) {
                this.isAnimationMixerRequired = required
            }
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.scene.camera.aspect = this.size.width / this.size.height
        this.scene.camera.updateProjectionMatrix()

        this.scene.renderer.setSize(this.size.width, this.size.height)
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
        if (this.clock) {
            EventBus.emit(GLEvents.UPDATE, {
                elapsedTime: this.clock.getElapsedTime() 
            })
        }

        if (this.isAnimationMixerRequired) {
            EventBus.emit(GLEvents.UPDATE_ANIMATION_MIXER, 1/60)
        }

        this.scene.renderer.render(this.scene, this.scene.camera)
    }
}

export default GL