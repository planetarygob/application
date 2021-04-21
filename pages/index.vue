<template>
  <div class="relative">
      <template v-if="sunSelected && shouldShowTeasingTexts">
            <div
                class="container flex flex-col justify-center p-8 w-3/12 absolute text-white mx-auto"
                style="left: 52.5%; top: 35%">
                <h1 class="font-extrabold text-3xl">{{ sunSelected.teasing.title }}</h1>
                <span class="text-gray-400 text-sm mt-3">{{ sunSelected.teasing.description }}</span>
                <button
                    class="mt-10 w-40 bg-white bg-opacity-25 text-white border-white border hover:bg-white hover:text-purple-500 font-bold py-2 px-4 rounded-full"
                    @click="discoverSun()">
                    DECOUVRIR
                </button>
            </div>
            <div 
                class="absolute left-0 ml-6 cursor-pointer"
                style="top: 50%"
                @click="previous">
                <svg-icon
                    svg-name="arrow_left"
                    :width="24"
                    :height="24"
                    color="#FFFFFF" />
            </div>
            <div 
                class="absolute right-0 mr-6 cursor-pointer"
                style="top: 50%"
                @click="next">
                <svg-icon 
                    svg-name="arrow_right"
                    :width="24"
                    :height="24"
                    color="#FFFFFF" />
            </div>
        </template>
    <web-gl />
    <tracker />
  </div>
</template>

<script>

import WebGl from '../components/WebGL.vue'
import Tracker from '../components/Tracker.vue'
import GL from '../assets/js/webgl/GL'
import SvgIcon from '../components/SvgIcon.vue'

import {
    PerspectiveCamera,
    Clock,
    Object3D,
    PointLight,
    CatmullRomCurve3,
    Vector3
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
        bubbles: Map,
        selectedObjects: [],
        emitter: null,
        bubbleModel: null,
        sunSelected: null,
        bubbleSelected: null,
        sunLight: PointLight,
        canClick: true,
        canMouseOver: true,
        firstZoomIsAlreadyLaunched: false,
        shouldShowTeasingTexts: false,
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
        ]
    }),

    async mounted() {
        this.gl = GL.getInstance()

        this.sunLight = new PointLight('#ffffff', 3, 8)
        this.gl.scene.add(this.sunLight)

        this.gl.loadingManager.loadAllModels(this.onError, this.onLoading, this.onAllModelsLoaded, this.onModelLoaded)
    },

    methods: {

        onAllModelsLoaded () {
            this.suns = this.gl.loadingManager.getGLTFsByType('sun')

            for (let [sunKey, sun] of this.suns) {
                let sunInfos = this.gl.loadingManager.getGLTFInfos(sunKey)

                sunInfos.model = sun.scene.children[0].clone()
                sunInfos.model.rotation.y = Math.PI
                sunInfos.model.position.set(0, 0, 0)
                sunInfos.model.scale.set(0.05, 0.05, 0.05)
                sunInfos.light = this.sunLight
                sunInfos.model.visible = false

                this.launchBigBangAnimation(sunInfos)

                this.gl.scene.add(sunInfos.model)
            }

            this.listenBackEvents()
        },

        launchBigBangAnimation (sun) {
            let self = this
            
            let bingBangTimeline = gsap.timeline({onComplete: () => {
                TweenLite.delayedCall(5, this.firstZoom())
            }})

            bingBangTimeline.set(sun.model, {
                visible: true,
                delay: 0.5
            }).to(sun.model.position, {
                delay: 1,
                duration: 2,
                x: sun.position.x,
                y: sun.position.y,
                z: sun.position.z,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
        },

        firstZoom () {
            if (!this.firstZoomIsAlreadyLaunched) {
                this.firstZoomIsAlreadyLaunched = true
                let sunInfos = this.gl.loadingManager.getGLTFInfos('mode')
                this.sunClicked(sunInfos, null)
            }
        },

        zoomCameraOnSun (sun) {
            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 3,
                x: sun.position.x,
                y: sun.position.y + 4,
                z: sun.position.z - 20,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
            
            gsap.to(sun.model.position, {
                duration: 2,
                x: sun.position.x + 10,
                y: sun.position.y - 3
            })
            
            var timeline = gsap.timeline({onComplete: () => {
                TweenLite.delayedCall(0.2, () => {
                    this.shouldShowTeasingTexts = true
                })
            }})

            timeline.to(this.gl.controls.target, {
                duration: 3,
                x: sun.position.x,
                y: sun.position.y,
                z: sun.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            })
        },

        hideSun () {
            if (this.emitter) {
                this.emitter.destroy()
                this.emitter = null
            }
        },

        sunClicked (sun, event) {
            this.sunSelected = sun

            // this.triggerSuns(false, true)
            this.zoomCameraOnSun(sun)
            this.canMouseOver = false

            this.gl.controls.target.set(sun.position.x, sun.position.y, sun.position.z)
            this.canClick = false
        },

        sunHovered (sun, event) {
            if (this.canMouseOver) {
                document.body.style.cursor = 'pointer';

                gsap.to(sun.model.scale, {
                    duration: 1,
                    x: 0.06,
                    y: 0.06,
                    z: 0.06
                })
                sun.light.position.set(sun.model.position.x, sun.model.position.y + 4, sun.model.position.z)
                this.gl.scene.add(sun.light)
            }
        },

        sunMouseOut (sun, event) {
            document.body.style.cursor = 'default';

            gsap.to(sun.model.scale, {
                duration: 1,
                x: 0.04,
                y: 0.04,
                z: 0.04
            })
            this.gl.scene.remove(sun.light)
        },

        bubbleHovered (bubble, event) {
            document.body.style.cursor = 'pointer';

            gsap.to(bubble.model.scale, {
                duration: 1,
                x: 0.015,
                y: 0.015,
                z: 0.015
            })
            bubble.light.position.set(bubble.model.position.x, bubble.model.position.y + 4, bubble.model.position.z)
            this.gl.scene.add(bubble.light)
        },

        bubbleMouseOut (bubble, event) {
            document.body.style.cursor = 'default';

            gsap.to(bubble.model.scale, {
                duration: 1,
                x: 0.01,
                y: 0.01,
                z: 0.01
            })
            this.gl.scene.remove(bubble.light)
        },

        addSunBubblesOnScene (sun) {
            this.bubbles = this.gl.loadingManager.getGLTFsByType('bubble')

            for (let bubble of this.sunSelected.bubbles) {
                let bubbleModel = this.bubbles.get(bubble.name)

                bubble.model = bubbleModel.scene.clone()
                bubble.model.scale.set(0.5, 0.5, 0.5)
                bubble.light = this.sunLight
                bubble.model.position.set(this.sunSelected.position.x + bubble.position.x, this.sunSelected.position.y + bubble.position.y, this.sunSelected.position.z + bubble.position.z)

                bubble.model.addEventListener('click', this.bubbleClicked.bind(event, bubble))

                this.sunSelected.model.add(bubble.model)
                // this.gl.scene.add(bubble.model)
                this.gl.interactionManager.add(bubble.model);
            }
        },

        bubbleClicked (bubble, event) {
            this.bubbleSelected = bubble

            this.sunSelected.model.visible = false

            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: bubble.position.x,
                y: bubble.position.y + 1,
                z: bubble.position.z - 2,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })

            var timeline = gsap.timeline();
            timeline.to(this.gl.controls.target, {
                duration: 2,
                x: bubble.position.x,
                y: bubble.position.y,
                z: bubble.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            }).call(this.triggerBubbles, [false, true], "+1.5")

            this.gl.controls.target.set(bubble.position.x, bubble.position.y, bubble.position.z)
        },

        triggerBubbles (visible, others = false) {
            for (let bubble of this.sunSelected.bubbles) {
                if (others) {
                     if (this.bubbleSelected.name !== bubble.name) {
                        bubble.model.visible = visible
                    }
                } else {
                    bubble.model.visible = visible
                }
            }
        },

        triggerSuns (visible, others = false) {
            for (let [sunKey, sun] of this.suns) {
                let sunInfos = this.gl.loadingManager.getGLTFInfos(sunKey)
                if (others) {
                    if (this.sunSelected.name !== sunInfos.name) {
                        sunInfos.model.visible = visible
                    }
                } else {
                    sunInfos.model.visible = visible
                }
            }
        },

        backOnSelectedSun () {
            this.gl.controls.enableZoom = false
            this.triggerBubbles(true, true)
            this.sunSelected.model.visible = true
            this.bubbleSelected = null

            let self = this

            gsap.to(this.gl.camera.position, {
                duration: 2,
                x: this.sunSelected.position.x,
                y: this.sunSelected.position.y + 3,
                z: this.sunSelected.position.z - 10,
                onUpdate: function () {
                    self.gl.camera.updateProjectionMatrix();
                }
            })
            gsap.to(this.gl.controls.target, {
                duration: 2,
                x: this.sunSelected.position.x,
                y: this.sunSelected.position.y,
                z: this.sunSelected.position.z,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            })
        },

        backOnSunsChoice () {
            this.canClick = true
            this.triggerSuns(true, true)
            this.triggerBubbles(false)
            this.sunSelected = null

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
            gsap.to(this.gl.controls.target, {
                duration: 2,
                x: 0,
                y: 0.075,
                z: 0,
                onUpdate: function () {
                    self.gl.controls.update()
                }
            })
            this.canMouseOver = true
        },

        listenBackEvents () {
            document.addEventListener('keyup', (event) => {
                var key = event.keyCode || event.charCode;
                // press back
                if (key == 8) {
                    this.gl.controls.target.set(0, 0.75, 0)
                    this.canClick = true

                    if (this.bubbleSelected) {
                        this.backOnSelectedSun()
                    } else {
                        this.backOnSunsChoice()
                    }
                }
            })
        },

        onError (error) {
            // console.log('error', error);
        },
    
        onLoading (xhr) {
            // console.log('xhr', xhr);
        },
        
        onModelLoaded (gltf) {
            //
        },

        discoverSun () {
            console.log('discover sun')
        },

        previous () {
            console.log('previous');
            for (const [sunKey, value] of this.suns.entries()) {
                let currentSun = this.gl.loadingManager.getGLTFInfos(sunKey)
                currentSun.currentPosition = this.getNextPosition(currentSun.currentPosition)

                if (currentSun.currentPosition === 0) {
                    this.sunSelected = currentSun
                }

                gsap.to(currentSun.model.position, {
                    duration: 2,
                    x: this.positions[currentSun.currentPosition].x,
                    y: this.positions[currentSun.currentPosition].y,
                    z: this.positions[currentSun.currentPosition].z,
                })
            }
        },

        getNextPosition (currentPosition) {
            if (currentPosition === this.suns.size - 1) {
                return 0
            }

            return currentPosition + 1
        },

        next () {
            console.log('next');
            for (const [sunKey, value] of this.suns.entries()) {
                let currentSun = this.gl.loadingManager.getGLTFInfos(sunKey)
                currentSun.currentPosition = this.getPreviousPosition(currentSun.currentPosition)

                if (currentSun.currentPosition === 0) {
                    this.sunSelected = currentSun
                }

                gsap.to(currentSun.model.position, {
                    duration: 2,
                    x: this.positions[currentSun.currentPosition].x,
                    y: this.positions[currentSun.currentPosition].y,
                    z: this.positions[currentSun.currentPosition].z,
                })
            }
        },

        getPreviousPosition (currentPosition) {
            if (currentPosition === 0) {
                return this.suns.size - 1
            }

            return currentPosition - 1
        },
    }
}
</script>

<style>

</style>
