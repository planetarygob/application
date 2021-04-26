import Scene from './core/Scene'
import { 
    Clock
} from 'three'
import Stats from '../utils/dev/Stats'
import CustomInteractionManager from '../utils/managers/CustomInteractionManager'
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
    isInteractionManagerRequired: boolean
    isHighlighterManagerRequired: boolean

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
        this.isHighlighterManagerRequired = false

        this.clock = new Clock()

        this.listenEvents()

        this.animateWithInterval()
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
        EventBus.on<boolean>(GLEvents.UPDATE_HIGHLIGHT_MANAGER, (required) => {
            if (required !== undefined) {
                this.isHighlighterManagerRequired = required
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

    animateWithInterval () {
        // interactionManager couteux
        setInterval(() => {
            if (this.isInteractionManagerRequired) {
                CustomInteractionManager.getInstance(this.scene.renderer, this.scene.camera).update()
            }
        }, 300)
        
    }

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

        if (this.isHighlighterManagerRequired) {
            EventBus.emit(GLEvents.UPDATE_HIGHLIGHT_MANAGER)
        }

        if (this.isInteractionManagerRequired) {
            EventBus.emit(GLEvents.UPDATE_INTERACTION_MANAGER)
        }

        // Tracker.update(this.scene.renderer.render)

        this.scene.renderer.render(this.scene, this.scene.camera)
    }
}

export default GL