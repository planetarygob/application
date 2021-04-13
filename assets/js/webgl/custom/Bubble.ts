import { 
    IcosahedronGeometry, 
    Mesh, 
    Object3D, 
    ShaderMaterial 
} from 'three'
import bubbleVertexShader from '../shaders/Bubble/vertex'
import bubbleFragmentShader from '../shaders/Bubble/fragment'
import GUI from '../../utils/GUI'
import EventBus from '../../utils/EventBus'

class Bubble extends Object3D {
    vertexShader: string
    fragmentShader: string
    material: ShaderMaterial
    mesh: Mesh

    constructor(
        radius?: number, 
        detail?: number
    ) {
        super()

        this.userData = {
            speed: 0.2,
            density: 0.75,
            strength: 0.1
        }

        this.GUI()

        // TODO : remove geometry & material from globals and fix mesh.material.uniforms call in update

        this.vertexShader = bubbleVertexShader 
        this.fragmentShader = bubbleFragmentShader
        const geometry = new IcosahedronGeometry(radius, detail)
        this.material = new ShaderMaterial({
            vertexShader: bubbleVertexShader,
            fragmentShader: bubbleFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: this.userData.speed },
                uNoiseDensity: { value: this.userData.density },
                uNoiseStrength: { value: this.userData.strength }
            },
            wireframe: true
        })
        this.mesh = new Mesh(geometry, this.material)
              
        EventBus.on('gl:update', (e: any) => this.update(e.elapsedTime))
    }

    // ---------------- INITIALIZATION

    GUI() {
        const bubbleFolder = GUI.addFolder('Bubble')
        bubbleFolder.add(this.userData, 'speed', 0, 2.5, 0.1)
        bubbleFolder.add(this.userData, 'density', 0, 2.5, 0.1)
        bubbleFolder.add(this.userData, 'strength', 0, 2.5, 0.1)
    }

    // ---------------- METHODS

    // ---------------- LIFECYCLE

    update(elapsedTime: number) {
        this.material.uniforms.uTime.value = elapsedTime
        this.material.uniforms.uSpeed.value = this.userData.speed
        this.material.uniforms.uNoiseDensity.value = this.userData.density
        this.material.uniforms.uNoiseStrength.value = this.userData.strength
    }

}

export default Bubble
