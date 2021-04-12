import { IcosahedronGeometry, Mesh, Object3D, ShaderMaterial } from 'three'
import bubbleVertexShader from '../shaders/Bubble/vertex'
import bubbleFragmentShader from '../shaders/Bubble/fragment'
import { GUI } from 'dat.gui'
import EventBusManager from '../../managers/EventBusManager'

class Bubble extends Object3D {
    gui: GUI
    vertexShader: string
    fragmentShader: string
    geometry: IcosahedronGeometry
    material: ShaderMaterial
    mesh: Mesh

    constructor(
        radius?: number, 
        detail?: number
    ) {
        super()

        EventBusManager.getInstance().emitter.on('foo', (e: any) => console.log('foo', e))

        this.userData = {
            speed: 0.2,
            density: 1.5,
            strength: 0.2
        }

        this.gui = new GUI()
        this.initGui()

        this.vertexShader = bubbleVertexShader 
        this.fragmentShader = bubbleFragmentShader

        this.geometry = new IcosahedronGeometry(radius, detail)

        this.material = new ShaderMaterial({
            vertexShader: bubbleVertexShader,
            fragmentShader: bubbleFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: this.userData.speed },
                uNoiseDensity: { value: this.userData.density },
                uNoiseStrength: { value: this.userData.strength }
            },
            wireframe: true,
        })

        this.mesh = new Mesh(this.geometry, this.material)

    }

    // ---------------- INITIATION

    initGui() {
        const bubbleFolder = this.gui.addFolder('Bubble')
        bubbleFolder.add(this.userData, 'speed', 0, 2.5, 0.1);
        bubbleFolder.add(this.userData, 'density', 0, 2.5, 0.1);
        bubbleFolder.add(this.userData, 'strength', 0, 2.5, 0.1);
    }

    // ---------------- METHODS

    explode() {
    }

    onMouseMove() {

    }

    // ---------------- LIFECYCLE

    update(elapsedTime: number) {
        this.material.uniforms.uTime.value = elapsedTime
        this.material.uniforms.uSpeed.value = this.userData.speed
        this.material.uniforms.uNoiseDensity.value = this.userData.density
        this.material.uniforms.uNoiseStrength.value = this.userData.strength
    }

}

export default Bubble