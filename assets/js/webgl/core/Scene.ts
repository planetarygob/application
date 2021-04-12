import { Scene as TScene } from 'three'
import mitt, { Emitter } from 'mitt'
import EventBusManager from '../../managers/EventBusManager'

class Scene extends TScene {

    constructor() {
        super()
    }

    trigger() {
        EventBusManager.getInstance().emitter.emit('foo', { a: 'b' })
    }
}

export default Scene