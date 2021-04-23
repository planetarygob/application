<template>
    <div class="relative">
        <template v-if="systemSelected && showSystemTexts">
            <div
                class="container flex flex-col justify-center p-8 w-3/12 absolute text-white mx-auto"
                style="left: 52.5%; top: 35%">
                <h1 class="font-extrabold text-3xl">{{ systemSelected.teasing.title }}</h1>
                <span class="text-gray-400 text-sm mt-3">{{ systemSelected.teasing.description }}</span>
                <button
                    class="mt-10 w-40 bg-white bg-opacity-25 text-white border-white border hover:bg-white hover:text-purple-500 font-bold py-2 px-4 rounded-full"
                    @click="discoverSystem()">
                    DECOUVRIR
                </button>
            </div>
            <div 
                class="absolute left-0 ml-6 cursor-pointer"
                style="top: 50%"
                @click="previousSystem">
                <svg-icon
                    svg-name="arrow_left"
                    :width="24"
                    :height="24"
                    color="#FFFFFF" />
            </div>
            <div 
                class="absolute right-0 mr-6 cursor-pointer"
                style="top: 50%"
                @click="nextSystem">
                <svg-icon 
                    svg-name="arrow_right"
                    :width="24"
                    :height="24"
                    color="#FFFFFF" />
            </div>
        </template>
        <div 
            class="absolute left-0 ml-20 flex flex-row cursor-pointer"
            @click="backOnPreviousView">
            <svg-icon
                svg-name="arrow_left"
                :width="22"
                :height="22"
                color="#FFFFFF"
                style="margin-top: 5px" />
            <span class="ml-3 text-white font-bold">RETOUR</span>
        </div>
        <web-gl />
        <tracker />
    </div>
</template>

<script>

import WebGl from '../components/WebGL.vue'
import Tracker from '../components/Tracker.vue'
import GL from '../assets/js/webgl/GL'
import SvgIcon from '../components/SvgIcon.vue'
import Planet from '../assets/js/webgl/custom/Planet'

import {
    PerspectiveCamera,
    Clock,
    Object3D,
    PointLight,
    CatmullRomCurve3,
    Vector3,
    AnimationMixer
} from 'three'
import { gsap, TweenLite } from 'gsap'

export default {
    components: {
        WebGl,
        Tracker,
        SvgIcon
    },
    
    data: () => ({
        gl: GL,
        models: [],
        systems: Map,
        suns: Map,
        planets: Map,
        emitter: null,
        planetModel: null,
        systemSelected: null,
        sunSelected: null,
        planetSelected: null,
        sunLight: PointLight,
        canClick: true,
        canMouseOver: true,
        firstZoomIsAlreadyLaunched: false,
        showSystemTexts: false,
        currentStep: 0,
        positions: [
            {
                x: 10,
                y: -3, 
                z: 0
            },
            {
                x: -75,
                y: 8, 
                z: 35
            },
            {
                x: 0,
                y: 0, 
                z: 75
            },
            {
                x: 75,
                y: 8, 
                z: 35
            },
        ],
        timeline: null,
        discoveringSystem: false,
        discoveringPlanet: false
    }),

    async mounted() {
        this.gl = GL.getInstance()

        this.sunLight = new PointLight('#ffffff', 3, 8)
        this.gl.scene.add(this.sunLight)

        this.gl.loadingManager.loadAllModels(this.onError, this.onLoading, this.onAllModelsLoaded, this.onModelLoaded)

        this.timeline = gsap.timeline()
    },

    methods: {

        onAllModelsLoaded () {
            console.log('onAllModelsLoaded');
            this.suns = this.gl.loadingManager.getGLTFsByType('sun')

            for (let [key, sun] of this.suns) {
                let systemInfos = this.gl.loadingManager.getGLTFInfos(key, true)

                systemInfos.sun.model = sun.scene.children[0].clone()
                systemInfos.sun.model.rotation.y = Math.PI
                systemInfos.sun.model.position.set(0, 0, 0)
                systemInfos.sun.model.scale.set(0.05, 0.05, 0.05)
                systemInfos.sun.light = this.sunLight
                systemInfos.sun.model.visible = false

                this.launchBigBangAnimation(systemInfos)

                this.gl.scene.add(systemInfos.sun.model)
            }
        },

        launchBigBangAnimation (systemInfos) {
            let self = this
            
            let bingBangTimeline = gsap.timeline({onComplete: () => {
                TweenLite.delayedCall(5, this.firstZoom())
            }})

            bingBangTimeline.set(systemInfos.sun.model, {
                visible: true,
                delay: 0.5
            }).to(systemInfos.sun.model.position, {
                delay: 1,
                duration: 2,
                x: systemInfos.position.x,
                y: systemInfos.position.y,
                z: systemInfos.position.z,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
        },

        firstZoom () {
            if (!this.firstZoomIsAlreadyLaunched) {
                this.firstZoomIsAlreadyLaunched = true
                let systemInfos = this.gl.loadingManager.getGLTFInfos('mode')
                this.sunClicked(systemInfos, null, true)
            }
        },

        sunClicked (systemInfos, event, firstZoom = false) {
            this.systemSelected = systemInfos

            if (firstZoom) {
                this.firstZoomOnSun(systemInfos)
            } else {
                this.zoomCameraOnSystem(systemInfos)
            }
            
            this.canMouseOver = false

            this.gl.controls.target.set(systemInfos.position.x, systemInfos.position.y, systemInfos.position.z)
            this.canClick = false
        },

        firstZoomOnSun (systemInfos) {
            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 3,
                x: systemInfos.position.x,
                y: systemInfos.position.y + 4,
                z: systemInfos.position.z - 20,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })

            gsap.to(systemInfos.sun.model.position, {
                duration: 2,
                x: systemInfos.position.x + 10,
                y: systemInfos.position.y - 3
            })

            this.timeline.to(this.gl.controls.target, {
                duration: 3,
                x: systemInfos.position.x,
                y: systemInfos.position.y,
                z: systemInfos.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            }).call(this.onZoomCompleted, [true, systemInfos], "-=1")
        },

        zoomCameraOnSystem (systemInfos) {
            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 3,
                x: 0,
                y: 4,
                z: -20,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })

            gsap.to(systemInfos.sun.model.position, {
                duration: 2,
                x: 0,
                y: - 2
            })

            this.timeline.to(this.gl.controls.target, {
                duration: 3,
                x: 0,
                y: 0,
                z: 0,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            }).call(this.onZoomCompleted, [false, systemInfos], "-=1")
        },

        onZoomCompleted (firstZoom, systemInfos) {          
            if (firstZoom) {
                this.showSystemTexts = true
            } else {
                this.addSystemPlanetsOnScene(systemInfos)
            }
        },

        addSystemPlanetsOnScene (systemInfos) {
            this.objects = this.gl.loadingManager.getGLTFsByType('object')
            this.gl.controls.enableRotate = true

            for (let planetInfos of systemInfos.planets) {
                let objectModel = this.objects.get(planetInfos.object.name)
                planetInfos.object.model = new Planet(this.gl.scene, this.gl.renderer, objectModel, new Vector3(planetInfos.position.x, planetInfos.position.y, planetInfos.position.z))
                planetInfos.object.model.position.set(planetInfos.position.x, planetInfos.position.y, planetInfos.position.z)

                planetInfos.object.model.addEventListener('click', this.planetClicked.bind(event, planetInfos))
                planetInfos.object.model.addEventListener('mouseover', this.planetHovered.bind(event, planetInfos))
                planetInfos.object.model.addEventListener('mouseout', this.planetMouseOut.bind(event, planetInfos))

                this.gl.scene.add(planetInfos.object.model)
                this.gl.interactionManager.add(planetInfos.object.model)
            }
        },

        planetClicked (planetInfos, event) {
            this.planetSelected = planetInfos
            // this.gl.controls.enableZoom = true

            this.systemSelected.sun.model.visible = false

            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: planetInfos.position.x,
                y: planetInfos.position.y + 2,
                z: planetInfos.position.z - 5,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })

            let timeline = gsap.timeline()
            timeline.to(this.gl.controls.target, {
                duration: 2,
                x: planetInfos.position.x,
                y: planetInfos.position.y,
                z: planetInfos.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            }).call(this.triggerPlanets, [false, true], "+1.5")

            let planetTimeline = gsap.timeline()
            planetTimeline.to(planetInfos.object.model.scale, {
                delay: 1,
                duration: 2.5,
                x: 0,
                y: 0,
                z: 0
            }).call(this.addPlanetSceneryOnScene, [planetInfos], 2)

            this.gl.controls.target.set(planetInfos.position.x, planetInfos.position.y, planetInfos.position.z)
        },

        planetHovered (planetInfos, event) {
            document.body.style.cursor = 'pointer';

            gsap.to(planetInfos.object.model.scale, {
                duration: 1,
                x: 1.2,
                y: 1.2,
                z: 1.2
            })
        },

        planetMouseOut (planetInfos, event) {
            document.body.style.cursor = 'default';

            gsap.to(planetInfos.object.model.scale, {
                duration: 1,
                x: 1,
                y: 1,
                z: 1
            })
        },

        addPlanetSceneryOnScene (planetInfos) {
            planetInfos.object.model.visible = false
            planetInfos.object.model.isComplete = true
            planetInfos.object.model.remove(planetInfos.object.model.bubble.mesh)
            this.gl.controls.enableRotate = true
            this.sceneries = this.gl.loadingManager.getGLTFsByType('scenery')

            const scenery = planetInfos.scenery
            if (!scenery) {
                return
            }

            const sceneryModel = this.sceneries.get(scenery.name)

            scenery.model = sceneryModel.scene.clone()
            scenery.model.scale.set(0.005, 0.005, 0.005)
            scenery.model.position.set(planetInfos.position.x, planetInfos.position.y, planetInfos.position.z)

            this.gl.scene.add(scenery.model)

            let sceneryTimeline = gsap.timeline()
            sceneryTimeline.to(scenery.model.scale, {
                duration: 2,
                x: 0.02,
                y: 0.02,
                z: 0.02
            })
        },

        discoverSystem () {
            this.showSystemTexts = false
            this.discoveringSystem = true
            this.zoomCameraOnSystem(this.systemSelected)
            this.triggerSystems(false, true)
        },

        previousSystem () {
            for (const [key, value] of this.suns) {
                let currentSystem = this.gl.loadingManager.getGLTFInfos(key, true)
                currentSystem.currentPosition = this.getNextPosition(currentSystem.currentPosition)

                if (currentSystem.currentPosition === 0) {
                    this.systemSelected = currentSystem
                }

                gsap.to(currentSystem.sun.model.position, {
                    duration: 2,
                    x: this.positions[currentSystem.currentPosition].x,
                    y: this.positions[currentSystem.currentPosition].y,
                    z: this.positions[currentSystem.currentPosition].z,
                })
            }
        },

        getNextPosition (currentPosition) {
            if (currentPosition === this.suns.size - 1) {
                return 0
            }

            return currentPosition + 1
        },

        nextSystem () {
            for (const [key, value] of this.suns) {
                let currentSystem = this.gl.loadingManager.getGLTFInfos(key, true)
                currentSystem.currentPosition = this.getPreviousPosition(currentSystem.currentPosition)

                if (currentSystem.currentPosition === 0) {
                    this.systemSelected = currentSystem
                }

                gsap.to(currentSystem.sun.model.position, {
                    duration: 2,
                    x: this.positions[currentSystem.currentPosition].x,
                    y: this.positions[currentSystem.currentPosition].y,
                    z: this.positions[currentSystem.currentPosition].z,
                })
            }
        },

        getPreviousPosition (currentPosition) {
            if (currentPosition === 0) {
                return this.suns.size - 1
            }

            return currentPosition - 1
        },

        triggerPlanets (visible, others = false) {
            for (let planet of this.systemSelected.planets) {
                if (others) {
                     if (this.planetSelected.name !== planet.name) {
                        planet.object.model.visible = visible
                    }
                } else {
                    planet.object.model.visible = visible
                }
            }
        },

        triggerSystems (visible, others = false) {
            for (let [key, sun] of this.suns) {
                let systemInfos = this.gl.loadingManager.getGLTFInfos(key, true)
                if (others) {
                    if (this.systemSelected.name !== systemInfos.name) {
                        systemInfos.sun.model.visible = visible
                    }
                } else {
                    systemInfos.sun.model.visible = visible
                }
            }
        },

        triggerScenery (visible) {
            this.planetSelected.scenery.model.visible = false
        },

        backOnPreviousView () {
            this.gl.controls.target.set(0, 0.75, 0)
            this.canClick = true

            if (this.planetSelected) {
                this.backOnSelectedSystem()
            } else {
                this.backOnSystemsChoice()
            }
        },

        backOnSelectedSystem () {
            this.triggerPlanets(true)
            this.triggerScenery(false)
            this.planetSelected.object.model.scale.set(0.7, 0.7, 0.7)
            this.systemSelected.sun.model.visible = true
            this.planetSelected = null

            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: this.systemSelected.position.x,
                y: this.systemSelected.position.y + 4,
                z: this.systemSelected.position.z - 20,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
            gsap.to(this.gl.controls.target, {
                duration: 2,
                x: this.systemSelected.position.x,
                y: this.systemSelected.position.y,
                z: this.systemSelected.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            })
        },

        backOnSystemsChoice () {
            this.canClick = true
            this.triggerSystems(true, true)
            this.triggerPlanets(false)
            this.systemSelected = null
            this.firstZoomIsAlreadyLaunched = false
            this.gl.controls.enableRotate = false


            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: 0,
                y: 15,
                z: -35,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })

            let timeline = gsap.timeline()
            timeline.to(this.gl.controls.target, {
                duration: 2,
                x: 0,
                y: 0.075,
                z: 0,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            }).call(this.firstZoom, null)
            
            this.canMouseOver = true
        },

        onError (error) {
            // console.log('error', error);
        },
    
        onLoading (xhr) {
            // console.log('xhr', xhr);
        },
        
        onModelLoaded (gltf) {
            console.log('gltf.userData.name', gltf.userData.name);
            // const satellite = 
            // const modelToImport = gltf.scene
            // modelToImport.position.set(Math.random() * 5, 1, 0)
            // modelToImport.scale.set(0.02, 0.02, 0.02)

            // this.gl.mixer = new AnimationMixer(modelToImport)
            // console.log('animation', gltf.animations[0]);
            // const animation = this.gl.mixer.clipAction(gltf.animations[0])

            // animation.play()
            // this.gl.scene.add(modelToImport)
        },

        // hideSun () {
        //     if (this.emitter) {
        //         this.emitter.destroy()
        //         this.emitter = null
        //     }
        // },

        // sunHovered (sun, event) {
        //     if (this.canMouseOver) {
        //         document.body.style.cursor = 'pointer';

        //         gsap.to(sun.model.scale, {
        //             duration: 1,
        //             x: 0.06,
        //             y: 0.06,
        //             z: 0.06
        //         })
        //         sun.light.position.set(sun.model.position.x, sun.model.position.y + 4, sun.model.position.z)
        //         this.gl.scene.add(sun.light)
        //     }
        // },

        // sunMouseOut (sun, event) {
        //     document.body.style.cursor = 'default';

        //     gsap.to(sun.model.scale, {
        //         duration: 1,
        //         x: 0.04,
        //         y: 0.04,
        //         z: 0.04
        //     })
        //     this.gl.scene.remove(sun.light)
        // },
    }
}
</script>

<style>

</style>
