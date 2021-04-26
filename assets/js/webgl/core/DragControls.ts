import { DragControls as TDragControls } from 'three/examples/jsm/controls/DragControls';
import EventBus from '../../utils/EventBus';
import { GLEvents } from '../../utils/Events';

class DragControls extends TDragControls {

    constructor(objects:any, camera: any, domElement: any) {
        super(objects, camera, domElement)

        this.addEventListener('dragstart', () => { EventBus.emit(GLEvents.TOGGLE_ORBIT_CONTROLS) })
        this.addEventListener('dragend', () => { EventBus.emit(GLEvents.TOGGLE_ORBIT_CONTROLS) })
    }

}

export default DragControls