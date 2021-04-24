import { 
    Scene as TScene, 
    WebGLRenderer, 
    Object3D, 
    Vector3, 
    Group, 
    PointsMaterial, 
    BufferGeometry, 
    BufferAttribute, 
    Points,
    sRGBEncoding,
    AmbientLight,
    DirectionalLight,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three'
import EventBus from '../../utils/EventBus'
import { CustomLoadingManager } from '../../utils/managers/CustomLoadingManager'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { gsap, TweenLite } from 'gsap'
import Camera from './Camera'
import Controls from './Controls'
import GL from '../GL'
import { UIEvents, GLEvents, AnimationEvents } from '../../utils/Events'
import Planet from '../custom/Planet'
import Renderer from './Renderer'
import Sky from '../custom/Sky'
import JSONSystems from '../../../datas/themes.json'
import System from '../custom/System'
import AnimationManager from '../../utils/managers/AnimationManager'

interface Size {
    width: number
    height: number
    ratio: number
}

class Scene extends TScene {
    loadingManager: CustomLoadingManager
    animationManager: AnimationManager
    camera: Camera
    controls: Controls
    isFirstZoomLaunched: Boolean
    timeline: gsap.core.Timeline
    canvas: HTMLCanvasElement
    size: Size
    renderer: WebGLRenderer
    systems: Array<System>
    selectedSystem?: System
    selectedPlanet?: Planet

    constructor(canvas: HTMLCanvasElement, size: Size) {
        super()

        this.size = size
        this.canvas = canvas

        this.renderer = new Renderer({ canvas: this.canvas }, this.size.width, this.size.height)
        this.camera = new Camera(75, this.size.width / this.size.height, 0.1, 1000)
        this.renderer.render(this, this.camera)

        this.controls = new Controls(this.camera, this.canvas)
        // todo: fire only on world change
        // this.controls.addEventListener('change', () => {
        //     EventBus.emit(GLEvents.UPDATE_CUBE_CAMERA)
        // })

        this.systems = []

        this.loadingManager = CustomLoadingManager.getInstance(this.renderer, this)
        this.loadingManager.loadAllModels(this.onError, this.onLoading, this.onAllModelsLoaded.bind(this), this.onModelLoaded)

        this.animationManager = AnimationManager.getInstance(this.camera, this.controls)
        
        this.isFirstZoomLaunched = false
        
        this.timeline = gsap.timeline()

        this.handleBackground()
        this.createLights()
    }

    onAllModelsLoaded () {
        console.log('onAllModelsLoaded')
        for (let systemInfos of JSONSystems) {
            const system = new System(systemInfos.name, new Vector3(systemInfos.initialPosition.x, systemInfos.initialPosition.y, systemInfos.initialPosition.z), systemInfos.teasing.title, systemInfos.teasing.description, systemInfos.navPosition)

            this.systems.push(system)

            this.animationManager.launchBigBangAnimation(system)

            this.add(system)
        }

        this.listenEvents()
    }

    listenEvents () {
        // SYSTEM SLIDE EVENTS
        EventBus.on(AnimationEvents.PREVIOUS_SYSTEM, () => {
            if (this.systems && this.systems.length) {
                // false = previous
                this.animationManager.slideToAnotherSystem(false, this.systems)
            }
        })
        EventBus.on(AnimationEvents.NEXT_SYSTEM, () => {
            if (this.systems && this.systems.length) {
                // true = next
                this.animationManager.slideToAnotherSystem(true, this.systems)
            }
        })


        // DISCOVER EVENTS
        EventBus.on<System>(AnimationEvents.DISCOVER_SYSTEM, (selectedSystem) => {
            if (selectedSystem) {
                this.selectedSystem = selectedSystem
                this.triggerSystems(false, true)
                this.animationManager.discoverSystem(selectedSystem)
            }
        })

        // ZOOM FINISHED EVENTS
        EventBus.on<boolean>(AnimationEvents.SYSTEM_ZOOM_FINISHED, (isFirstZoom) => {
            if (isFirstZoom) {
                EventBus.emit(UIEvents.SHOW_SYSTEM_TEXTS, true)
            } else if (this.selectedSystem) {
                this.triggerPlanets(true)
                EventBus.emit(GLEvents.UPDATE_INTERACTION_MANAGER, true)
                this.controls.enableRotate = true
            }
        })
        EventBus.on(AnimationEvents.PLANET_ZOOM_FINISHED, () => {
            this.triggerScenery(true)
            if (this.selectedPlanet) {
                this.animationManager.showSceneryAnimation(this.selectedPlanet)
            }
            
        })

        // GL PLANET EVENTS
        EventBus.on<Planet>(GLEvents.CLICK_PLANET, (selectedPlanet) => {
            if (selectedPlanet) {
                this.selectedPlanet = selectedPlanet
                if (this.selectedSystem) {
                    const sun = this.selectedSystem.children[0]
                    sun.visible = false
                }
                // setTimeOut?
                this.triggerPlanets(false, true)
                this.animationManager.discoverPlanet(selectedPlanet)
            }
        })
        EventBus.on<Planet>(GLEvents.MOUSE_OVER_PLANET, (selectedPlanet) => {
            if (selectedPlanet) {
                
            }
        })
        EventBus.on<Planet>(GLEvents.MOUSE_OUT_PLANET, (selectedPlanet) => {
            if (selectedPlanet) {
                
            }
        })
    }

    triggerSystems (visible: boolean, others: boolean = false) {
        if (this.systems && this.systems.length) {
            for (let system of this.systems) {
                if (others && this.selectedSystem) {
                    if (this.selectedSystem.name !== system.name) {
                        system.visible = visible
                    }
                } else {
                    system.visible = visible
                }
            }
        }
    }

    triggerPlanets (visible: boolean, others: boolean = false) {
        if (this.systems && this.systems.length) {
            for (let system of this.systems) {
                for (let child of system.children) {
                    if (child instanceof Planet) {
                        const planet = child
                        if (others && this.selectedPlanet) {
                            if (this.selectedPlanet.name !== planet.name) {
                                planet.triggerPlanet(visible)
                            }
                        } else {
                            planet.triggerPlanet(visible)
                        }
                    }
                }
            }
        }
    }

    triggerScenery (visible: boolean) {
        if (this.selectedPlanet && this.selectedPlanet.scenery) {
            this.selectedPlanet.triggerScenery(visible)
        }
    }

    handleBackground () {
        const sky = new Sky(this.canvas.width,this.canvas.height)
        this.add(sky.mesh)

        this.addBackgroundStars()
    }

    addBackgroundStars () {
        // ___________________________ PARTICLES

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
        this.add(particles)
    }

    createLights() {
        const ambientLight = new AmbientLight(0xaa54f0, 1)
      
        const directionalLight1 = new DirectionalLight(0xffffff, 1)
        directionalLight1.position.set(-2, 2, 5)
      
        const directionalLight2 = new DirectionalLight(0xfff000, 1)
        directionalLight2.position.set(-2, 4, 4)
        directionalLight2.castShadow = true
      
        this.add(ambientLight, directionalLight1, directionalLight2)
    }

    onError (error: ErrorEvent) {

    }

    onLoading (xhr: ProgressEvent<EventTarget>) {

    }
    
    onModelLoaded (gltf: GLTF) {
        console.log('gltf name', gltf.userData.name);
    }
    
}

export default Scene