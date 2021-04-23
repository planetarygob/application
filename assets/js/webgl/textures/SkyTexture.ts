import { Texture } from "three"

class SkyTexture extends Texture {
    canvas: HTMLCanvasElement
    context: any
    width: number
    height: number
    gradient: CanvasGradient
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

        // TODO : Migrate strings to color format 0x000000
        // new Color(0x000000)
        this.tColor = 'rgba(36,27,61,1)'
        this.bColor = 'rgba(12,7,20,1)'
        // this.bColor = 'rgba(59,25,74,1)'

        this.gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
        // this.tColor.getHexString()
        // TODO : Could be added to a GUI folder, both colors & stops
        this.gradient.addColorStop(0.1, this.tColor);
        this.gradient.addColorStop(.9, this.bColor);

        this.context.fillStyle = this.gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default SkyTexture
