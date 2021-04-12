import { IcosahedronGeometry, Mesh, Object3D, ShaderMaterial } from 'three'
import bubbleVertexShader from '../shaders/Bubble/vertex'
import bubbleFragmentShader from '../shaders/Bubble/fragment'
import { GUI } from 'dat.gui'

class Bubble extends Object3D {
    gui: any
    vertexShader: string
    fragmentShader: string
    geometry: IcosahedronGeometry
    material: ShaderMaterial
    mesh: any
    settings: any

    constructor(radius?: number, detail?: number) {
        super()
        
        this.settings = {
            speed: 0.2,
            density: 1.5,
            strength: 0.2
        }

        this.initGui()

        this.vertexShader = bubbleVertexShader 
        this.fragmentShader = bubbleFragmentShader

        this.geometry = new IcosahedronGeometry(radius, detail)

        this.material = new ShaderMaterial({
            vertexShader: bubbleVertexShader,
            fragmentShader: bubbleFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: this.settings.speed },
                uNoiseDensity: { value: this.settings.density },
                uNoiseStrength: { value: this.settings.strength }
            },
            wireframe: true,
        })

        this.mesh = new Mesh(this.geometry, this.material)
    }

    // ---------------- INITIATION

    initGui() {
        this.gui = new GUI()
        
        const bubbleFolder = this.gui.addFolder('Bubble')
        bubbleFolder.add(this.settings, 'speed', 0, 2.5, 0.1);
        bubbleFolder.add(this.settings, 'density', 0, 2.5, 0.1);
        bubbleFolder.add(this.settings, 'strength', 0, 2.5, 0.1);
    }

    // ---------------- METHODS

    explode() {
    }

    // ---------------- LIFECYCLE

    update(elapsedTime: number) {
        this.mesh.material.uniforms.uTime.value = elapsedTime
        this.mesh.material.uniforms.uSpeed.value = this.settings.speed
        this.mesh.material.uniforms.uNoiseDensity.value = this.settings.density
        this.mesh.material.uniforms.uNoiseStrength.value = this.settings.strength
    }
}

export default Bubble