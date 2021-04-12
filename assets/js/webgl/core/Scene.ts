import { Scene as TScene } from 'three'
import mitt from 'mitt'

class Scene extends TScene {

    emitter: any 

    constructor() {
        super()

        this.emitter = mitt()
        console.log('1', this.emitter)
    }

    trigger() {
        console.log('2')
        this.emitter.emit('foo', { a: 'b' })
    }
}

export default Scene