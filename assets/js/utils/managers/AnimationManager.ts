import System from "../../webgl/custom/System";
import EventBus from "../EventBus";
import { GLEvents, AnimationEvents } from "../Events";
import { SystemsData } from "../../webgl/data/SystemsData";
import { gsap } from 'gsap'
import Camera from "../../webgl/core/Camera";
import Controls from "../../webgl/core/Controls";
import Planet from "../../webgl/custom/Planet";

class AnimationManager {
    private static instance: AnimationManager
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

    public static getInstance (camera: Camera, controls: Controls): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager(camera, controls);
        }
 
        return AnimationManager.instance;
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

    discoverPlanet (planet: Planet) {
        this.controls.enableZoom = true

        const self = this

        gsap.to(this.camera.position, {
            duration: 2,
            x: planet.initialPosition.x,
            y: planet.initialPosition.y + 2,
            z: planet.initialPosition.z - 5,
            onUpdate: function () {
                self.camera.updateProjectionMatrix();
            }
        })

        let timeline = gsap.timeline()
        timeline.to(this.controls.target, {
            duration: 2,
            x: planet.initialPosition.x,
            y: planet.initialPosition.y,
            z: planet.initialPosition.z,
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
        }).call(() => EventBus.emit(AnimationEvents.PLANET_ZOOM_FINISHED), [], "-=1")

        this.controls.target.set(planet.initialPosition.x, planet.initialPosition.y, planet.initialPosition.z)
    }

    showSceneryAnimation (planet: Planet) {

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
}

export default AnimationManager