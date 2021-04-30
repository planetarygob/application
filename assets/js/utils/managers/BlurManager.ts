import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import Scene from "../../webgl/core/Scene"
import GUI from "../dev/GUI"
import EventBus from "../EventBus"
import { GLEvents } from "../Events"

class BlurManager {
    scene: Scene
    isEnabled: boolean
    postprocessing: any
    effectController: any

    constructor(
        scene: Scene
    ) {
        this.scene = scene
        this.isEnabled = true

        this.postprocessing = {}
        this.effectController = {
            focus: 20,
            aperture: 10,
            maxblur: 0.01
        }

        this.init()
        this.matChanger()

        // TODO : Remove once it's ok
        GUI.add( this.effectController, "focus", 0, 40, 0.01 ).onChange( this.matChanger.bind(this) )
        GUI.add( this.effectController, "aperture", 0, 10, 0.01 ).onChange( this.matChanger.bind(this) )
        GUI.add( this.effectController, "maxblur", 0.0, 0.01, 0.001 ).onChange( this.matChanger.bind(this) )

        EventBus.on(GLEvents.UPDATE, this.update.bind(this))
        EventBus.on(GLEvents.RESIZE, this.resize.bind(this))
    }

    init() {
        const renderPass = new RenderPass( this.scene, this.scene.camera )
        const bokehPass = new BokehPass( this.scene, this.scene.camera, {
            focus: this.effectController.focus,
            aperture: this.effectController.aperture,
            maxblur: this.effectController.maxblur,

            width: this.scene.size.width,
            height: this.scene.size.height
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

    resize() {
        this.postprocessing.composer.setSize( this.scene.size.width, this.scene.size.height )
    }

    update() {
        if (this.isEnabled) {
            this.postprocessing.composer.render()
        }
    }
}

export default BlurManager