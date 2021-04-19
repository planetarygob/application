import { CubeCamera, WebGLCubeRenderTarget } from "three";
import EventBus from "../../utils/EventBus";
import { GLEvents } from "../../utils/GLEvents";
import Renderer from "../core/Renderer";
import Scene from "../core/Scene";

class BubbleCamera extends CubeCamera {

    constructor(near: number, far: number, renderTarget: WebGLCubeRenderTarget, renderer: Renderer, scene: Scene) {
        super(near, far, renderTarget)

        EventBus.on(GLEvents.UPDATE_CUBE_CAMERA, () => this.update( renderer, scene ))
    }
    
}

export default BubbleCamera