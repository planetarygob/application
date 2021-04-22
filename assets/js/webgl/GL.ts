import { 
    PerspectiveCamera,
    Clock,
    MeshBasicMaterial,
    Mesh,
    DirectionalLight,
    AmbientLight,
    TorusKnotGeometry,
    BoxGeometry,
    SphereGeometry,
    PointsMaterial,
    Points,
    BufferGeometry,
    BufferAttribute,
    sRGBEncoding
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Bubble from './custom/Bubble'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import Sky from './custom/Sky'
import { GLEvents } from '../utils/GLEvents'
import Tracker from '../utils/dev/Tracker'
import GUI from '../utils/dev/GUI'
import { initGUI } from '../utils/dev/GUIFolders'
import Planet from './custom/Planet'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    canvas: HTMLCanvasElement
    scene: Scene 
    renderer: Renderer 
    camera: PerspectiveCamera
    controls: OrbitControls
    clock: Clock
    size: Size

    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any

    constructor() {
        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)
        initGUI()

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement
        if (this.canvas) {
            this.canvas.width = this.size.width
            this.canvas.height = this.size.height
        }

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(45, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.z = 5

        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        this.clock = new Clock()

        this.renderer = new Renderer({ 
                canvas: this.canvas,
                alpha: false,
                antialiasing: true
            }, 
            this.size.width, 
            this.size.height
        )
        this.renderer.render(this.scene, this.camera)

        this.addElements()
        this.addEvents()

        this.animate()
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL()
        }
 
        return GL.instance
    }

    // ---------------- METHODS

    addElements() {
        // TODO : createCamera()
        // NOTE : Update camera layer range if needed, atm 0 - 1
        this.camera.layers.enable( 1 )
        this.scene.add( this.camera )
        this.camera.position.z = 30

        // TODO : Should not be here at the end, should rather be in Scene.ts

        const loader = new GLTFLoader();

        loader.load( 'https://florianblandin.fr/assets/sun_mode.gltf', ( gltf ) => {
            gltf.scene.scale.set(0.007, 0.007, 0.007)
            gltf.scene.position.y = -0.25
            this.scene.add( gltf.scene )
        }, undefined, function ( error ) {
            console.error( error )
        })

        const bubble = new Bubble( 1, 12, this.scene, this.renderer )
        // this.scene.add( bubble.mesh )
        bubble.mesh.position.z = -3

        const planet = new Planet( this.scene, this.renderer )
        this.scene.add(planet)
        planet.position.x = -5
        planet.position.y = 1
        planet.position.z = -5

        const planet2 = new Planet( this.scene, this.renderer )
        this.scene.add(planet2)
        planet2.position.x = -5
        planet2.position.y = -1
        planet2.position.z = 5

        const planet3 = new Planet( this.scene, this.renderer )
        this.scene.add(planet3)
        planet3.position.x = 6
        planet3.position.y = 1
        planet3.position.z = 0

        // TODO : createSky()
        const sky = new Sky( this.canvas.width, this.canvas.height )
        this.scene.add( sky.mesh )

        // ___________________________

        const particlesMaterial = new PointsMaterial({
            size: 0.02,
            sizeAttenuation: true
        })

        // Geometry
        const particlesGeometry = new BufferGeometry()
        const count = 500

        const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)

        for(let i = 0; i < count * 3; i++) // Multiply by 3 for same reason
        {
            positions[i] = (Math.random() - 0.5) * 60 // Math.random() - 0.5 to have a random value between -0.5 and +0.5
        }

        particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3)) // Create the Three.js BufferAttribute and specify that each information is composed of 3 values

        const particles = new Points(particlesGeometry, particlesMaterial)
        this.scene.add(particles)

        this.renderer.outputEncoding = sRGBEncoding
        this.createLights()
    }

    addEvents() {
        window.addEventListener( 'resize', this.resize.bind(this) )
        this.controls.addEventListener('change', () => {
            EventBus.emit(GLEvents.UPDATE_CUBE_CAMERA)
        })
        this.canvas.addEventListener( 'click', () => {
            EventBus.emit(GLEvents.CLICK)
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( this.size.width, this.size.height )

        this.camera.updateProjectionMatrix()
    }

    createLights() {
        const ambientLight = new AmbientLight(0xaa54f0, 1)
      
        const directionalLight1 = new DirectionalLight(0xffffff, 1)
        directionalLight1.position.set(-2, 2, 5)
      
        const directionalLight2 = new DirectionalLight(0xfff000, 1)
        directionalLight2.position.set(-2, 4, 4)
        directionalLight2.castShadow = true
      
        this.scene.add(ambientLight, directionalLight1, directionalLight2)
    }

    // ---------------- LIFECYCLE

    animate() {
        Stats.update()

        window.requestAnimationFrame( this.animate.bind(this) )

        this.render()
    }

    render() {
        const elapsedTime = this.clock.getElapsedTime()

        this.controls.update()

        Tracker.update( this.renderer.info.render )
        EventBus.emit(GLEvents.UPDATE, { elapsedTime: elapsedTime })

        this.renderer.render( this.scene, this.camera )
    }
}

export default GL