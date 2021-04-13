class Sky {
    canvas: HTMLCanvasElement
    context: any
    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.canvas = document.createElement('canvas')
        this.canvas.id = 'skyTexture'
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.context = this.canvas.getContext('2d')
    }
  
    render() {
      // Create gradient
      const grd = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
      grd.addColorStop(0.1, 'rgb(135,196,196)');
      grd.addColorStop(.9, 'rgb(255,152,158)');
  
      // Fill with gradient
      this.context.fillStyle = grd;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default Sky