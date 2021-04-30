<template>
    <div class="relative">
        <div class="filter"></div>
        <template v-if="selectedSystem && showSystemTexts">
            <div
                class="container flex flex-col justify-center p-8 w-3/12 absolute text-white mx-auto"
                style="left: 52.5%; top: 35%">
                <h1 class="font-extrabold text-3xl">{{ selectedSystem.title }}</h1>
                <span class="text-gray-400 text-sm mt-3">{{ selectedSystem.description }}</span>
                <button
                    class="mt-10 w-40 bg-white bg-opacity-25 text-white border-white border font-bold py-2 px-4 rounded-full"
                    :class="selectedSystem.name !== 'quiz' ? 'hover:bg-white hover:text-purple-500' : ''"
                    :disabled="selectedSystem.name === 'quiz'"
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
        <loader />
        <planet-modal
            v-if="selectedPlanetInfos && selectedPlanetInfos.modalContent"
            :is-displayed.sync="displayModal"
            :content="selectedPlanetInfos.modalContent"
        />
        <planet-dialog
            v-if="selectedPlanetInfos && selectedPlanetInfos.dialogContent"
            :is-displayed.sync="displayDialog"
            :content="selectedPlanetInfos.dialogContent" />
        <web-gl />
    </div>
</template>

<script lang="ts">

import WebGl from '../components/WebGL.vue'
import SvgIcon from '../components/SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { UIEvents, GLEvents, AnimationEvents } from '../assets/js/utils/Events'
import System from '../assets/js/webgl/custom/System'
import PlanetModal from '../components/PlanetModal.vue'
import PlanetDialog from '../components/PlanetDialog.vue'
import Tracker from '../components/Tracker.vue'
import Loader from '~/components/Loader.vue'

export default {
    components: {
        WebGl,
        Tracker,
        SvgIcon,
        PlanetModal,
        PlanetDialog,
        Loader
    },
    
    data: () => ({
        selectedSystem: System,
        selectedPlanetInfos: null,
        discoveringSystem: false,
        showSystemTexts: false,
        displayModal: false,
        displayDialog: false
    }),

    mounted() {
        EventBus.on<boolean>(UIEvents.SHOW_SYSTEM_TEXTS, (newValue) => this.showSystemTexts = newValue)
        EventBus.on<System>(GLEvents.SELECTED_SYSTEM, (newValue) => this.selectedSystem = newValue)
        EventBus.on(UIEvents.SELECTED_PLANET_INFOS, (newValue) => {
            this.selectedPlanetInfos = newValue
        })
        EventBus.on<boolean>(UIEvents.SHOW_PLANET_DIALOG, (newValue) => {
            this.displayDialog = newValue
        })
        EventBus.on<boolean>(UIEvents.SHOW_PLANET_MODAL, (newValue) => {
            this.displayModal = newValue
        })
    },

    methods: {
        discoverSystem () {
            if (this.selectedSystem.name === 'mode') {
                this.showSystemTexts = false
                this.discoveringSystem = true
                EventBus.emit(AnimationEvents.DISCOVER_SYSTEM, this.selectedSystem)
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

<style scoped>
    button:disabled {
        opacity: 0.5;
    }

    /* .filter {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 20%;
        background: rgba(255, 0, 0, 0.048);
        backdrop-filter: blur(10px);
    } */
</style>
