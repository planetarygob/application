import { 
    WebGLRenderer as TRenderer,
    ACESFilmicToneMapping,
    sRGBEncoding
} from 'three'

class Renderer extends TRenderer {

    constructor(canvas: any, width: any, height: any) {
        super(canvas)

        this.setSize(width, height)
        this.setPixelRatio(window.devicePixelRatio);
        this.toneMapping = ACESFilmicToneMapping;
        this.toneMappingExposure = 1;
        this.outputEncoding = sRGBEncoding;
    }
}

export default Renderer