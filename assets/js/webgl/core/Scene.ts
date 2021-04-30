import { 
    Scene as TScene, 
    WebGLRenderer,
    Vector3, 
    PointsMaterial, 
    BufferGeometry, 
    BufferAttribute, 
    Points,
    AnimationMixer
} from 'three'
import EventBus from '../../utils/EventBus'
import { CustomLoadingManager } from '../../utils/managers/CustomLoadingManager'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import Camera from './Camera'
import Controls from './Controls'
import { UIEvents, GLEvents, AnimationEvents } from '../../utils/Events'
import Planet from '../custom/Planet'
import Renderer from './Renderer'
import Sky from '../custom/Sky'
import JSONSystems from '../../../datas/themes.json'
import System from '../custom/System'
import CameraAnimationManager from '../../utils/managers/CameraAnimationManager'
import DragControls from './DragControls'
import CustomInteractionManager from '../../utils/managers/CustomInteractionManager'
import HighlightManager from '../../utils/managers/HighlightManager'

interface Size {
    width: number
    height: number
    ratio: number
}

class Scene extends TScene {
    loadingManager: CustomLoadingManager
    cameraAnimationManager: CameraAnimationManager
    interactionManager: CustomInteractionManager
    highlightManager: HighlightManager
    animationMixer?: AnimationMixer
    camera: Camera
    controls: Controls
    dragControls: DragControls
    draggableObjects: Array<any>
    isFirstZoomLaunched: Boolean
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

        this.camera = new Camera(75, this.size.width / this.size.height, 0.1, 1000)
        this.renderer = new Renderer({ canvas: this.canvas }, this.size.width, this.size.height)
        this.renderer.render(this, this.camera)

        this.controls = new Controls(this.camera, this.canvas)
        this.draggableObjects = []
        this.dragControls = new DragControls(this.draggableObjects, this.camera, this.renderer.domElement)

        // TODO: Fire only on world change
        // this.controls.addEventListener('change', () => {
        //     EventBus.emit(GLEvents.UPDATE_CUBE_CAMERA)
        // })

        this.systems = []

        this.loadingManager = CustomLoadingManager.getInstance(this.renderer)
        this.loadingManager.loadAllModels(this.onError, this.onLoading, this.onAllModelsLoaded.bind(this), this.onModelLoaded.bind(this))

        this.interactionManager = CustomInteractionManager.getInstance(this.renderer, this.camera)

        this.highlightManager = HighlightManager.getInstance(this.renderer, this, this.camera)

        this.cameraAnimationManager = CameraAnimationManager.getInstance(this.camera, this.controls)
        
        this.isFirstZoomLaunched = false

        this.handleBackground()

        EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
            if (this.animationMixer) {
                this.animationMixer.update(deltaTime)
            }
        })
    }

    onAllModelsLoaded () {
        EventBus.emit(UIEvents.TOGGLE_LOADER)
        for (let systemInfos of JSONSystems) {
            const system = new System(systemInfos.name, new Vector3(systemInfos.initialPosition.x, systemInfos.initialPosition.y, systemInfos.initialPosition.z), systemInfos.teasing.title, systemInfos.teasing.description, systemInfos.navPosition)

            this.systems.push(system)

            this.cameraAnimationManager.launchBigBangAnimation(system)

            this.add(system)
        }

        this.listenEvents()
    }

    listenEvents () {
        // SYSTEM SLIDE EVENTS
        EventBus.on(AnimationEvents.PREVIOUS_SYSTEM, () => {
            if (this.systems && this.systems.length) {
                // false = previous
                this.cameraAnimationManager.slideToAnotherSystem(false, this.systems)
            }
        })
        EventBus.on(AnimationEvents.NEXT_SYSTEM, () => {
            if (this.systems && this.systems.length) {
                // true = next
                this.cameraAnimationManager.slideToAnotherSystem(true, this.systems)
            }
        })

        // DISCOVER EVENTS
        EventBus.on<System>(AnimationEvents.DISCOVER_SYSTEM, (selectedSystem) => {
            if (selectedSystem) {
                this.selectedSystem = selectedSystem
                this.triggerSystems(false, true)
                this.cameraAnimationManager.discoverSystem(selectedSystem)
            }
        })

        // ZOOM FINISHED EVENTS
        EventBus.on<boolean>(AnimationEvents.SYSTEM_ZOOM_FINISHED, (isFirstZoom) => {
            if (isFirstZoom) {
                EventBus.emit(UIEvents.SHOW_SYSTEM_TEXTS, true)
            } else if (this.selectedSystem) {
                this.triggerPlanets(true)
                this.controls.enableRotate = true
            }
        })
        EventBus.on(AnimationEvents.PLANET_ZOOM_FINISHED, () => {
            this.triggerScenery(true)
            if (this.selectedSystem) {
                this.selectedSystem.triggerSun(false)
            }
            this.triggerPlanets(false, true)
            this.controls.enableRotate = false
            if (this.selectedPlanet) {
                this.cameraAnimationManager.showScenery(this.selectedPlanet)
            }
        })

        // GL PLANET EVENTS
        EventBus.on<Planet>(GLEvents.CLICK_PLANET, (selectedPlanet) => {
            console.log('CLICK_PLANET', );
            if (selectedPlanet) {
                this.cameraAnimationManager.discoverPlanet(selectedPlanet)
                this.selectedPlanet = selectedPlanet
                const selectedPlanetInfos = this.loadingManager.getGLTFInfos(this.selectedPlanet.name)
                EventBus.emit(UIEvents.SELECTED_PLANET_INFOS, selectedPlanetInfos)
            }
        })
        // EventBus.on<Planet>(GLEvents.MOUSE_OVER_PLANET, (selectedPlanet) => {
        //     if (selectedPlanet) {
        //         this.animationManager.hoverPlanet(selectedPlanet)
        //     }
        // })
        // EventBus.on<Planet>(GLEvents.MOUSE_OUT_PLANET, (selectedPlanet) => {
        //     if (selectedPlanet) {
        //         this.animationManager.outPlanet(selectedPlanet)
        //     }
        // })

        // BACK EVENTS
        EventBus.on(AnimationEvents.BACK, () => {
            if (this.selectedPlanet && this.selectedSystem) {
                this.triggerPlanets(true)
                this.selectedPlanet.triggerObject(true)
                this.selectedPlanet.complete()
                this.selectedPlanet = undefined
                this.selectedSystem.triggerSun(true)
                EventBus.emit(GLEvents.HIGHLIGHT_MANAGER_REQUIRED, false)
                EventBus.emit(UIEvents.RESET_PLANET_DIALOG)
                this.cameraAnimationManager.backOnSystemDiscoveredView(this.selectedSystem)
            } else if (this.selectedSystem) {
                this.triggerSystems(true, true)
                this.triggerPlanets(false)
                this.cameraAnimationManager.backOnSystemsChoiceView(this.selectedSystem)
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
        // this.add(sky.mesh)

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

    onError (error: ErrorEvent) {

    }

    onLoading (xhr: ProgressEvent<EventTarget>) {
        
    }
    
    onModelLoaded (gltf: GLTF) {
        // console.log('gltf name', gltf.userData.name);
        this.loadingManager.loadedModels += 1
        const progress = 100 / 16 * this.loadingManager.loadedModels

        EventBus.emit(UIEvents.UPDATE_LOADER, {
            progress: progress
        })
    }
    
}

export default Scene