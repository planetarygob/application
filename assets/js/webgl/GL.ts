import Scene from './core/Scene'
import { 
    Clock
} from 'three'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/Events'

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
    isHighlightManagerRequired: boolean
    isInteractionManagerRequired: boolean

    constructor() {

        // Stats.showPanel(0)
        // document.body.appendChild(Stats.dom)

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.scene = new Scene(this.canvas, this.size)

        this.clock = new Clock()

        this.isHighlightManagerRequired = false
        this.isInteractionManagerRequired = false

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
        EventBus.on<boolean>(GLEvents.HIGHLIGHT_MANAGER_REQUIRED, (required) => {
            if (required !== undefined) {
                this.isHighlightManagerRequired = required
            }
        })
        EventBus.on<boolean>(GLEvents.INTERACTION_MANAGER_REQUIRED, (required) => {
            if (required !== undefined) {
                this.isInteractionManagerRequired = required
            }
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.scene.camera.aspect = this.size.width / this.size.height
        this.scene.camera.updateProjectionMatrix()

        this.scene.renderer.setSize( this.size.width, this.size.height )

        EventBus.emit(GLEvents.RESIZE)
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
        this.scene.renderer.render(this.scene, this.scene.camera)

        if (this.clock) {
            EventBus.emit(GLEvents.UPDATE, this.clock.getElapsedTime())
            // TODO : Maybe it's not needed to create a custom event for the scenery tool, should just listen to UPDATE event since it gives the same parameter
            EventBus.emit(GLEvents.UPDATE_TOOL_SCALE, this.clock.getElapsedTime())
        }

        // TODO: deltaTime instead 1/60
        EventBus.emit(GLEvents.UPDATE_ANIMATION_MIXER, 1/60)

        if (this.isHighlightManagerRequired) {
            EventBus.emit(GLEvents.UPDATE_HIGHLIGHT_MANAGER)
        }

        if (this.isInteractionManagerRequired) {
            EventBus.emit(GLEvents.UPDATE_INTERACTION_MANAGER)
        }
    }
}

export default GL