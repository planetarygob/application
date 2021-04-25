import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { WebGLRenderer, PerspectiveCamera, Vector2, Object3D } from 'three';

class HighlightManager {
    private static instance: HighlightManager
    composer: EffectComposer|null
    outlinePass: OutlinePass
    renderPass: RenderPass|null
    shaderPass: ShaderPass|null

    constructor (renderer: WebGLRenderer, scene: THREE.Scene, camera: PerspectiveCamera) {
        this.composer = new EffectComposer(renderer);

        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);

        this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight ), scene, camera);
        this.composer.addPass(this.outlinePass);

        this.shaderPass = new ShaderPass(FXAAShader);
        this.shaderPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        this.composer.addPass(this.shaderPass);
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

    render () {
        if (this.composer) {
            this.composer.render()
        }
    }

    dispose () {
        if (this.composer && this.shaderPass && this.renderPass) {
            this.composer.removePass(this.outlinePass)
            this.composer.removePass(this.shaderPass)
            this.composer.removePass(this.renderPass)
            this.outlinePass.dispose()
            this.shaderPass.material.dispose()
            this.shaderPass = null
            this.renderPass = null
        }
        this.composer = null
    }
}

export default HighlightManager