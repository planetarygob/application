<template>
    <div class="relative">
        <div class="filter"></div>
        <template v-if="selectedSystem && showSystemTexts">
            <div
                class="container flex flex-col justify-center p-8 absolute text-white mx-auto"
                style="left: 52.5%; top: 33%; width: 28%">
                <h1 class="font-extrabold text-4xl">{{ selectedSystem.title }}</h1>
                <span class="text-gray-400 text-md mt-3">{{ selectedSystem.description }}</span>
                <button
                    class="mt-10 w-40 bg-white bg-opacity-25 text-white border-white border font-bold py-2 px-4 rounded-full"
                    :class="selectedSystem.name !== 'quiz' ? 'hover:bg-white hover:text-purple-500' : ''"
                    :style="selectedSystem.name === 'quiz' ? 'opacity: 0.5' : ''"
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
                svg-name="back"
                :width="49"
                :height="49"
                color="#FFFFFF"
                style="margin-top: 5px" />
        </div>
        <loader />
        <informations-dialog 
            v-if="informationsDialog.isDisplayed"
            :content="informationsDialog.content"
            :is-displayed.sync="informationsDialog.isDisplayed" />
        <progress-bar :is-displayed.sync="isProgressBarDisplayed" />
        <template v-if="selectedPlanetInfos">
            <planet-modal
                v-if="selectedPlanetInfos.modalContent"
                :is-displayed.sync="isPlanetModalDisplayed"
                :content="selectedPlanetInfos.modalContent" />
            <planet-dialog
                v-if="selectedPlanetInfos.dialogContent"
                :is-displayed.sync="isPlanetDialogDisplayed"
                :content="selectedPlanetInfos.dialogContent" />
            <scenery-interaction-instruction
                v-if="isSceneryInstructionDisplayed && selectedPlanetInfos.scenery && selectedPlanetInfos.scenery.interaction"
                :instruction="selectedPlanetInfos.scenery.interaction.instruction" />
        </template>
        <web-gl />
    </div>
</template>

<script lang="ts">

import WebGl from '../components/WebGL.vue'
import SvgIcon from '../components/SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { UIEvents, GLEvents, AnimationEvents, ProgressBarEvents } from '../assets/js/utils/Events'
import System from '../assets/js/webgl/custom/System'
import PlanetModal from '../components/planet/PlanetModal.vue'
import PlanetDialog from '../components/planet/PlanetDialog.vue'
import SceneryInteractionInstruction from '../components/scenery/InteractionInstruction.vue'
import Tracker from '../components/Tracker.vue'
import Loader from '~/components/Loader.vue'
import InformationsDialog from '~/components/InformationsDialog.vue'

export default {
    components: {
        WebGl,
        Tracker,
        SvgIcon,
        PlanetModal,
        PlanetDialog,
        Loader,
        SceneryInteractionInstruction
    },
    
    data: () => ({
        selectedSystem: System,
        selectedPlanetInfos: null,
        discoveringSystem: false,
        showSystemTexts: false,
        isPlanetModalDisplayed: false,
        isPlanetDialogDisplayed: false,
        isSceneryInstructionDisplayed: false,
        isProgressBarDisplayed: false,
        informationsDialog: {
            isDisplayed: false,
            content: {}
        }
    }),

    mounted() {
        this.listenEvents()
    },

    methods: {
        listenEvents () {
            EventBus.on<boolean>(UIEvents.SHOW_SYSTEM_TEXTS, (newValue) => {
                if (newValue !== undefined) {
                    this.showSystemTexts = newValue
                }
            })
            EventBus.on<System>(GLEvents.SELECTED_SYSTEM, (newValue) => {
                if (newValue !== undefined) {
                    this.selectedSystem = newValue
                }
            })
            EventBus.on(UIEvents.SELECTED_PLANET_INFOS, (newValue) => {
                this.selectedPlanetInfos = newValue
            })
            EventBus.on<boolean>(UIEvents.SHOW_PLANET_DIALOG, (newValue) => {
                if (newValue !== undefined) {
                    this.isPlanetDialogDisplayed = newValue
                }
            })
            EventBus.on<boolean>(UIEvents.SHOW_PLANET_MODAL, (newValue) => {
                if (newValue !== undefined) {
                    this.isPlanetModalDisplayed = newValue
                }
            })
            EventBus.on<boolean>(UIEvents.SHOW_SCENERY_INTERACTION_INSTRUCTION, (newValue) => {
                if (newValue !== undefined) {
                    this.isSceneryInstructionDisplayed = newValue
                }
            })
            EventBus.on(AnimationEvents.BACK_ON_SYSTEM_CHOICE, () => {
                this.discoveringSystem = false
            })
            EventBus.on(UIEvents.SHOW_INFORMATIONS_DIALOG, ({visible, content}) => {
                this.informationsDialog.isDisplayed = visible
                this.informationsDialog.content = content
            })
            EventBus.on<boolean>(ProgressBarEvents.SHOW_PROGRESS_BAR, (visible) => {
                if (visible !== undefined) {
                    this.isProgressBarDisplayed = visible
                }
            })
        },

        discoverSystem () {
            if (this.selectedSystem.name === 'mode') {
                this.showSystemTexts = false
                this.discoveringSystem = true
                EventBus.emit(AnimationEvents.DISCOVER_SYSTEM, this.selectedSystem)
            } else if (this.selectedSystem.name === 'quiz') {
                EventBus.emit(UIEvents.SHOW_INFORMATIONS_DIALOG, {
                    visible: true,
                    content: {
                        name: "locker",
                        image: {
                            name: "locker",
                            size: {
                                width: "32px",
                                height: "32px"
                            }
                        },
                        title: "ACCÈS BLOQUÉ",
                        text: "Pour débloquer l’accès à la station spatiale, tu dois parcourir toutes les planètes pour les remettre en orbite: ramène le plus d’informations possible!",
                        action: "Continuer"
                    }
                })
            }
        },

        previousSystem () {
            EventBus.emit(AnimationEvents.PREVIOUS_SYSTEM)
        },

        nextSystem () {
            EventBus.emit(AnimationEvents.NEXT_SYSTEM)
        },

        backOnPreviousView () {
            EventBus.emit(AnimationEvents.BACK)
        },
    }
}
</script>
