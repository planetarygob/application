import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import EventBus from '../../utils/EventBus';
import { GLEvents } from '../../utils/Events';

class Controls extends OrbitControls {

    constructor(camera: any, canvas: any) {
        super(camera, canvas)
        this.enableZoom = false
        this.enableRotate = false
        this.enablePan = false

        EventBus.on(GLEvents.TOGGLE_ORBIT_CONTROLS, () => { this.enabled = !this.enabled })
    }
}

export default Controls