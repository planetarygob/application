import { WebGLRenderer as TRenderer } from 'three'

class Renderer extends TRenderer {

    constructor(
        canvas: any, 
        width: any, 
        height: any
    ) {
        super(canvas)

        this.setSize(width, height)
    }
}

export default Renderer