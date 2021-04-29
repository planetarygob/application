import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { WebGLRenderer, PerspectiveCamera, Vector2, Object3D } from 'three';
import { GLEvents } from '../Events';
import EventBus from '../EventBus';

class HighlightManager {
    private static instance: HighlightManager
    composer: EffectComposer|null
    outlinePass: OutlinePass
    renderPass: RenderPass|null

    constructor (renderer: WebGLRenderer, scene: THREE.Scene, camera: PerspectiveCamera) {
        this.composer = new EffectComposer(renderer);

        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);

        this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera);
        this.outlinePass.renderToScreen = true
        this.composer.addPass(this.outlinePass);

        EventBus.on(GLEvents.UPDATE_HIGHLIGHT_MANAGER, () => {
            this.update()
        })
    }

    public static getInstance (renderer: WebGLRenderer, scene: THREE.Scene, camera: PerspectiveCamera): HighlightManager {
        if (!HighlightManager.instance) {
            HighlightManager.instance = new HighlightManager(renderer, scene, camera);
        }
 
        return HighlightManager.instance;
    }

    add(object: Object3D) {
        this.outlinePass.selectedObjects.push(object)
    }

    update () {
        if (this.composer) {
            // TODO improve delta time
            this.composer.render(1/60)
        }
    }

    dispose () {
        if (this.composer && this.renderPass) {
            this.composer.removePass(this.outlinePass)
            this.composer.removePass(this.renderPass)
            this.outlinePass.dispose()
            this.renderPass = null
        }
        this.composer = null
    }
}

export default HighlightManager