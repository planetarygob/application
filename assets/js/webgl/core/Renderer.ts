import { 
    WebGLRenderer as TRenderer,
    ACESFilmicToneMapping,
    sRGBEncoding
} from 'three'

class Renderer extends TRenderer {

    constructor(canvas: any, width: any, height: any) {
        super(canvas)

        this.setSize(width, height)
        this.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.toneMapping = ACESFilmicToneMapping
        this.toneMappingExposure = 1
        this.outputEncoding = sRGBEncoding
        this.setClearColor(0x130B24, 1)
    }
}

export default Renderer