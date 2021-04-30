import Scene from './core/Scene'
import { 
    Clock
} from 'three'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/Events'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import GUI from '../utils/dev/GUI'

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
    // ------------------------------ BLUR
    materials: any
    ojects: any
    postprocessing: any
    effectController: any
    // ------------------------------

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
        

        // ------------------------------ BLUR
        this.materials = []
        this.ojects = []
        this.postprocessing = {}

        this.effectController = {
            focus: 0,
            aperture: 10,
            maxblur: 0.01
        }

        this.initPostprocessing()

        GUI.add( this.effectController, "focus", -100, 100, 1 ).onChange( this.matChanger.bind(this) )
        GUI.add( this.effectController, "aperture", 0, 15, 1 ).onChange( this.matChanger.bind(this) )
        GUI.add( this.effectController, "maxblur", 0.0, 0.01, 0.001 ).onChange( this.matChanger.bind(this) )

        this.matChanger.bind(this)

        // ------------------------------

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

        this.scene.renderer.setSize( this.size.width, this.size.height )
        this.postprocessing.composer.setSize( this.size.width, this.size.height )
    }

    // ------------------------------ BLUR

    initPostprocessing() {
        const renderPass = new RenderPass( this.scene, this.scene.camera )
        const bokehPass = new BokehPass( this.scene, this.scene.camera, {
            focus: this.effectController.focus,
            aperture: this.effectController.aperture,
            maxblur: this.effectController.maxblur,

            width: this.size.width,
            height: this.size.height
        } )

        const composer = new EffectComposer( this.scene.renderer )

        composer.addPass( renderPass )
        composer.addPass( bokehPass )

        this.postprocessing.composer = composer
        this.postprocessing.bokeh = bokehPass
    }

    matChanger() {
        this.postprocessing.bokeh.uniforms[ "focus" ].value = this.effectController.focus;
        this.postprocessing.bokeh.uniforms[ "aperture" ].value = this.effectController.aperture * 0.00001;
        this.postprocessing.bokeh.uniforms[ "maxblur" ].value = this.effectController.maxblur;
    }

    // ------------------------------

    // ---------------- LIFECYCLE
    // TODO : Rework so that we're not dependent of the user's framerate

    animate() {
        Stats.begin()

        window.requestAnimationFrame(this.animate.bind(this))
        this.render()

        Stats.end()
    }

    render() {
        // ------------------------------ BLUR

        // ------------------------------
        if (this.clock) {
            EventBus.emit(GLEvents.UPDATE, {
                elapsedTime: this.clock.getElapsedTime() 
            })
        }

        if (this.isAnimationMixerRequired) {
            EventBus.emit(GLEvents.UPDATE_ANIMATION_MIXER, 1/60)
        }

        this.scene.renderer.render(this.scene, this.scene.camera)

        this.postprocessing.composer.render()

    }
}

export default GL