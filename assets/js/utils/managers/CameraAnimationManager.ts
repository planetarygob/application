import System from "../../webgl/custom/System";
import EventBus from "../EventBus";
import { GLEvents, AnimationEvents, UIEvents } from "../Events";
import { SystemsData } from "../../webgl/data/SystemsData";
import { gsap } from 'gsap'
import Camera from "../../webgl/core/Camera";
import Controls from "../../webgl/core/Controls";
import Planet from "../../webgl/custom/Planet";
import BlurManager from "./BlurManager";

class CameraAnimationManager {
    private static instance: CameraAnimationManager
    camera: Camera
    controls: Controls
    timeline: gsap.core.Timeline
    isFirstZoomLaunched: boolean

    constructor (camera: Camera, controls: Controls) {
        this.camera = camera
        this.controls = controls

        this.timeline = gsap.timeline()
        this.isFirstZoomLaunched = false
    }

    public static getInstance (camera: Camera, controls: Controls): CameraAnimationManager {
        if (!CameraAnimationManager.instance) {
            CameraAnimationManager.instance = new CameraAnimationManager(camera, controls);
        }
 
        return CameraAnimationManager.instance;
    }

    launchBigBangAnimation (system: System) {
        const self = this
        const sun = system.children[0]

        let bingBangTimeline = gsap.timeline({onComplete: () => {
            if (!this.isFirstZoomLaunched) {
                this.isFirstZoomLaunched = true
                this.firstZoomOnSystem(system)
            }
        }})

        bingBangTimeline.set(sun, {
            visible: true,
            delay: 0.5
        }).to(system.position, {
            delay: 1,
            duration: 2,
            x: system.initialPosition.x,
            y: system.initialPosition.y,
            z: system.initialPosition.z,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })
    }

    firstZoomOnSystem (system: System) {
        EventBus.emit(GLEvents.SELECTED_SYSTEM, system)

        const self = this

        gsap.to(this.camera.position, {
            duration: 3,
            x: system.initialPosition.x,
            y: system.initialPosition.y + 4,
            z: system.initialPosition.z - 20,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })

        gsap.to(system.position, {
            duration: 2,
            x: system.initialPosition.x + 10,
            y: system.initialPosition.y - 3
        })

        this.timeline.to(this.controls.target, {
            duration: 3,
            x: system.initialPosition.x,
            y: system.initialPosition.y,
            z: system.initialPosition.z,
            onUpdate: function () {
                self.controls.update()
            }
        }).call(() => EventBus.emit(AnimationEvents.SYSTEM_ZOOM_FINISHED, true), [], "-=1")

        this.controls.target.set(system.initialPosition.x, system.initialPosition.y, system.initialPosition.z)
    }

    discoverSystem (selectedSystem: System) {
        const self = this

        gsap.to(this.camera.position, {
            duration: 3,
            x: 0,
            y: 4,
            z: -20,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })

        gsap.to(selectedSystem.position, {
            duration: 2,
            x: 0,
            y: - 2
        })

        this.timeline.to(this.controls.target, {
            duration: 3,
            x: 0,
            y: 0,
            z: 0,
            onUpdate: function () {
                self.controls.update()
            }
        }).call(() => EventBus.emit(AnimationEvents.SYSTEM_ZOOM_FINISHED, false), [], "-=1")

        this.controls.target.set(selectedSystem.initialPosition.x, selectedSystem.initialPosition.y, selectedSystem.initialPosition.z)
    }

    showBlur (blurManager: BlurManager) {
        gsap.timeline().fromTo(blurManager.postprocessing.bokeh.uniforms.maxblur, {value: 0}, {value: 0.007, duration: 5});
    }

    hideBlur (blurManager: BlurManager) {
        const blurTimeline = gsap.timeline({onComplete: () => {
            blurManager.isEnabled = false
        }})
        blurTimeline.fromTo(blurManager.postprocessing.bokeh.uniforms.maxblur, {value: 0.007}, {value: 0, duration: 5});
    }

    discoverPlanet (planet: Planet) {
        const self = this

        gsap.to(this.camera.position, {
            duration: 2,
            x: planet.infos.initialPosition.x,
            y: planet.infos.initialPosition.y + 1,
            z: planet.infos.initialPosition.z - 6,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })

        let timeline = gsap.timeline()
        timeline.to(this.controls.target, {
            duration: 2,
            x: planet.infos.initialPosition.x,
            y: planet.infos.initialPosition.y,
            z: planet.infos.initialPosition.z,
            onUpdate: function () {
                self.controls.update()
            }
        })

        let planetTimeline = gsap.timeline()
        planetTimeline.to(planet.scale, {
            delay: 1,
            duration: 2.5,
            x: 0,
            y: 0,
            z: 0
        }).call(() => {EventBus.emit(AnimationEvents.PLANET_ZOOM_FINISHED)}, [], "-=1.5")

        this.controls.target.set(planet.infos.initialPosition.x, planet.infos.initialPosition.y, planet.infos.initialPosition.z)
    }

    hoverPlanet (planet: Planet) {
        document.body.style.cursor = 'pointer';

        gsap.to(planet.scale, {
            duration: 1,
            x: 1.2,
            y: 1.2,
            z: 1.2
        })
    }

    outPlanet (planet: Planet) {
        document.body.style.cursor = 'default';

        gsap.to(planet.scale, {
            duration: 1,
            x: 1,
            y: 1,
            z: 1
        })
    }

    showScenery (planet: Planet) {
        if (planet && planet.scenery) {
            let sceneryTimeline = gsap.timeline({onComplete: () => {
                EventBus.emit(UIEvents.SHOW_PLANET_DIALOG, true)
            }})

            sceneryTimeline.to(planet.scale, {
                duration: 2,
                x: 1,
                y: 1,
                z: 1
            })

            gsap.timeline().to(planet.position, {
                x: planet.infos.initialPosition.x,
                y: planet.scenery.yPosition,
                z: planet.infos.initialPosition.z,
            })
        }
    }

    sceneryInteractionZoom () {
        gsap.timeline().to(this.camera.position, {
            duration: 2,
            x: this.camera.position.x,
            y: this.camera.position.y + 2,
            z: this.camera.position.z + 1.5
        })
        
        gsap.timeline().to(this.camera.rotation, {
            duration: 2,
            x: this.camera.rotation.x + 0.5
        })
    }

    sceneryInteractionDezoom () {
        gsap.timeline().to(this.camera.position, {
            duration: 2,
            x: this.camera.position.x,
            y: this.camera.position.y - 2,
            z: this.camera.position.z - 1.5
        })
        
        gsap.timeline().to(this.camera.rotation, {
            duration: 2,
            x: this.camera.rotation.x - 0.5,
            onComplete: () => {
                EventBus.emit(UIEvents.SHOW_PLANET_DIALOG, true)
            }
        })
    }

    slideToAnotherSystem (next: boolean, systems: Array<System>) {
        for (let system of systems) {
            system.navPosition = this.getFuturePosition(next, system.navPosition, systems.length)

            if (system.navPosition === 0) {
                EventBus.emit(GLEvents.SELECTED_SYSTEM, system)
            }

            gsap.to(system.position, {
                duration: 2,
                x: SystemsData.initialPositions[system.navPosition].x,
                y: SystemsData.initialPositions[system.navPosition].y,
                z: SystemsData.initialPositions[system.navPosition].z,
            })
        }
    }

    private getFuturePosition (next: boolean, navPosition: number, systemsLength: number) {
        if (next) {
            if (navPosition === 0) {
                return systemsLength - 1
            }
    
            return navPosition - 1
        } else {
            if (navPosition === systemsLength - 1) {
                return 0
            }
    
            return navPosition + 1
        }
    }

    backOnSystemDiscoveredView (selectedSystem: System) {
        
        let self = this

        this.controls.enableRotate = true

        gsap.to(this.camera.position, {
            duration: 2,
            x: selectedSystem.position.x,
            y: selectedSystem.position.y + 4,
            z: selectedSystem.position.z - 20,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })
        gsap.to(this.controls.target, {
            duration: 2,
            x: selectedSystem.position.x,
            y: selectedSystem.position.y,
            z: selectedSystem.position.z,
            onUpdate: function () {
                self.controls.update()
            }
        })
    }

    backOnSystemsChoiceView (selectedSystem: System) {
        this.isFirstZoomLaunched = false
        this.controls.enableRotate = false

        const self = this

        gsap.to(this.camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -35,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })

        let timeline = gsap.timeline()
        timeline.to(this.controls.target, {
            duration: 2,
            x: 0,
            y: 0.075,
            z: 0,
            onUpdate: function () {
                self.controls.update()
            }
        }).call(this.firstZoomOnSystem.bind(this), [selectedSystem])
    }
}

export default CameraAnimationManager