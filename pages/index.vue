<template>
    <div class="relative">
        <template v-if="selectedSystem && showSystemTexts">
            <div
                class="container flex flex-col justify-center p-8 w-3/12 absolute text-white mx-auto"
                style="left: 52.5%; top: 35%">
                <h1 class="font-extrabold text-3xl">{{ selectedSystem.title }}</h1>
                <span class="text-gray-400 text-sm mt-3">{{ selectedSystem.description }}</span>
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
            v-if="discoveringSystem"
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

<script lang="ts">

import WebGl from '../components/WebGL.vue'
import Tracker from '../components/Tracker.vue'
import GL from '../assets/js/webgl/GL'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import SvgIcon from '../components/SvgIcon.vue'
import Planet from '../assets/js/webgl/custom/Planet'
import EventBus from '../assets/js/utils/EventBus'
import { UIEvents, GLEvents, AnimationEvents } from '../assets/js/utils/Events'
import System from '../assets/js/webgl/custom/System'

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
        suns: Map,
        planets: Map,

        selectedSystem: System,
        discoveringSystem: false,

        sunSelected: null,
        planetSelected: null,
        sunLight: PointLight,
        canClick: true,
        canMouseOver: true,
        firstZoomIsAlreadyLaunched: false,
        showSystemTexts: false,
        currentStep: 0,
        timeline: null
    }),

    mounted() {
        EventBus.on(UIEvents.SHOW_SYSTEM_TEXTS, (newValue: boolean) => {
            console.log('SHOW_SYSTEM_TEXTS', newValue)
            this.showSystemTexts = newValue
        })
        EventBus.on(GLEvents.SELECTED_SYSTEM, (newValue: System) => {
            console.log('SELECTED_SYSTEM', newValue)
            this.selectedSystem = newValue
        })
    },

    methods: {
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
            EventBus.emit(AnimationEvents.DISCOVER_SYSTEM, this.selectedSystem)
        },

        previousSystem () {
            EventBus.emit(AnimationEvents.PREVIOUS_SYSTEM)
        },

        nextSystem () {
            EventBus.emit(AnimationEvents.NEXT_SYSTEM)
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
            this.selectedSystem.sun.model.visible = true
            this.planetSelected = null

            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: this.selectedSystem.position.x,
                y: this.selectedSystem.position.y + 4,
                z: this.selectedSystem.position.z - 20,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
            gsap.to(this.gl.controls.target, {
                duration: 2,
                x: this.selectedSystem.position.x,
                y: this.selectedSystem.position.y,
                z: this.selectedSystem.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            })
        },

        backOnSystemsChoice () {
            this.canClick = true
            this.triggerSystems(true, true)
            this.triggerPlanets(false)
            this.selectedSystem = null
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
        }
    }
}
</script>

<style>

</style>
