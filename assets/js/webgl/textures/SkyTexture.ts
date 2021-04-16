import { Texture } from "three"

class SkyTexture extends Texture {
    canvas: HTMLCanvasElement
    context: any
    width: number
    height: number
    gradient: CanvasGradient
    // TODO :  migrate strings to color format 0x000000
    tColor: string
    bColor: string

    constructor(width: number, height: number) {
        super()
        this.width = width
        this.height = height

        this.canvas = document.createElement('canvas')
        this.canvas.id = 'skyTexture'
        this.canvas.width = this.width
        this.canvas.height = this.height

        this.context = this.canvas.getContext('2d')

        // = new Color(0x000000)
        this.tColor = 'rgb(135,196,196)'
        this.bColor = 'rgb(255,152,158)'

        this.gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
        // this.tColor.getHexString()
        this.gradient.addColorStop(0.1, this.tColor);
        this.gradient.addColorStop(.9, this.bColor);

        this.context.fillStyle = this.gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default SkyTexture
