<template>
    <div class="relative">
        <div class="filter"></div>
        <video
            id="my_video"
            controls
            class="absolute"
            style="object-fit: cover;"
            @click="playVideo()">
            <source src="/videos/Intro_planetary.mp4" />
        </video>
        <audio 
            id="main_audio" 
            preload="none">
            <source 
                src="sound/ambiance_galaxie.mp3"
                type="audio/mpeg">
        </audio>
        <audio 
            id="mode_planet_skirt_audio" 
            preload="none">
            <source 
                src="https://florianblandin.fr/assets/sons/music_minijupe.mp3"
                type="audio/mpeg">
        </audio>
        <audio 
            id="mode_planet_rock_audio" 
            preload="none">
            <source 
                src="https://florianblandin.fr/assets/sons/music_rock.mp3"
                type="audio/mpeg">
        </audio>
        <audio 
            id="mode_planet_hippie_audio" 
            preload="none">
            <source 
                src="https://florianblandin.fr/assets/sons/music_hippie.mp3"
                type="audio/mpeg">
        </audio>
        <audio 
            id="nav_audio" 
            preload="none">
            <source 
                src="https://florianblandin.fr/assets/sons/woosh_vue_macro.mp3"
                type="audio/mpeg">
        </audio>
        <template v-if="selectedSystem && showSystemTexts">
            <div
                class="Macro_text container flex flex-col justify-center p-8 text-white mx-auto">
                <h1 class="text-4xl">{{ selectedSystem.title }}</h1>
                <p class="text-md mt-3">{{ selectedSystem.description }}</p>
                <button
                    class="Button"
                    :class="selectedSystem.name !== 'quiz' ? 'hover:bg-white hover:text-black' : ''"
                    :style="selectedSystem.name === 'quiz' ? 'opacity: 0.5' : ''"
                    @click="discoverSystem()"
                    @mouseenter="hoverButton()"
                    @mouseleave="hoverButton()">
                    Découvrir
                </button>
            </div>
            <div
                class="NavButton NavButton--prev"
                style="top: 50%"
                @click="previousSystem"
                @mouseenter="hoverButton()"
                @mouseleave="hoverButton()">
                <svg width="29" height="16" viewBox="0 0 29 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 8L0.999992 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 1L1 8L8 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

            </div>
            <div 
                class="NavButton NavButton--next"
                style="top: 50%"
                @click="nextSystem"
                @mouseenter="hoverButton()"
                @mouseleave="hoverButton()">
                <svg width="29" height="16" viewBox="0 0 29 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 8L28 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 1L28 8L21 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

            </div>
        </template>
        <button 
            v-if="discoveringSystem"
            class="Button Button--back"
            @click="backOnPreviousView"
            @mouseenter="hoverButton()"
            @mouseleave="hoverButton()">
        </button>
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
        <custom-cursor />
    </div>
</template>

<script lang="ts">

import WebGl from '../components/WebGL.vue'
import SvgIcon from '../components/SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { UIEvents, GLEvents, AnimationEvents, ProgressBarEvents, SoundEvents } from '../assets/js/utils/Events'
import System from '../assets/js/webgl/custom/System'
import PlanetModal from '../components/planet/PlanetModal.vue'
import PlanetDialog from '../components/planet/PlanetDialog.vue'
import SceneryInteractionInstruction from '../components/scenery/InteractionInstruction.vue'
import Tracker from '../components/Tracker.vue'
import Loader from '~/components/Loader.vue'
import InformationsDialog from '~/components/InformationsDialog.vue'
import CustomCursor from '~/components/CustomCursor.vue'

export default {
    components: {
        WebGl,
        Tracker,
        SvgIcon,
        PlanetModal,
        PlanetDialog,
        Loader,
        SceneryInteractionInstruction,
        CustomCursor
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
        },
        sceneryAudio: HTMLMediaElement
    }),

    mounted() {
        const audio: HTMLAudioElement|null = document.querySelector('#main_audio')
        const video: HTMLMediaElement|null = document.querySelector('#my_video')
        if (video) {
            video.volume = 0.8
            video.onended = function (e) {
                if (audio) {
                    audio.loop = true
                    audio.volume = 0.1
                    audio.play()
                }
                video.style.display = 'none'
                EventBus.emit(GLEvents.LAUNCH_EXPERIENCE)
            }
        }
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
            EventBus.on<string>(SoundEvents.LAUNCH_SOUND_SCENERY, (planetName) => {
                if (planetName !== undefined) {
                    this.sceneryAudio = document.querySelector(`#${planetName}_audio`)
                    if (this.sceneryAudio) {
                        this.sceneryAudio.volume = 0.1
                        this.sceneryAudio.play()
                    }
                }
            })
            EventBus.on<string>(SoundEvents.STOP_SOUND_SCENERY, () => {
                if (this.sceneryAudio) {
                    this.sceneryAudio.currentTime = 0;
                    this.sceneryAudio.pause();
                }
            })
        },

        discoverSystem () {
            if (this.selectedSystem.name === 'mode') {
                this.showSystemTexts = false
                this.discoveringSystem = true
                EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
                EventBus.emit(AnimationEvents.DISCOVER_SYSTEM, this.selectedSystem)
            } else if (this.selectedSystem.name === 'quiz') {
                EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
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
            const audio: HTMLAudioElement|null = document.querySelector('#nav_audio')
            if (audio) {
                audio.volume = 0.8
                audio.play()
            }
            EventBus.emit(AnimationEvents.PREVIOUS_SYSTEM)
        },

        nextSystem () {
            const audio: HTMLAudioElement|null = document.querySelector('#nav_audio')
            if (audio) {
                audio.volume = 0.1
                audio.play()
            }
            EventBus.emit(AnimationEvents.NEXT_SYSTEM)
        },

        backOnPreviousView () {
            EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
            EventBus.emit(AnimationEvents.BACK)
        },

        hoverButton() {
            EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
        },

        playVideo() {
            const video: HTMLMediaElement|null = document.querySelector('#my_video')
            if (video) {
                video.play()
                video.playbackRate = 0.93;
            }
        }
    }
}
</script>

<style scoped>
    * { cursor: none !important; }
    *:focus { outline: none; }

    body {
        overflow: hidden;
    }

    video {
        position: absolute;
        z-index: 1001;
        right: 0; 
        bottom: 0;
        min-width: 100%; 
        min-height: 100%;
        width: auto; 
        height: auto;
        background-size: cover;
    }

    audio {
        display: none;
    }

    .Macro_text {
        position: absolute;
        width: fit-content;
        top: 50%;
        left: 50%;
        transform: translateY(-50%)
    }

    h1 {
        font-family: 'Soulmaze', sans-serif;
        font-weight: bold;
        letter-spacing: 2.25px;
    }

    p {
        margin-top: 1rem;
        max-width: 445px;
        color: #C0ACD6;
    }

    .NavButton {
        position: absolute;
        top: 50%;
        transform: translateY(-50%)
    }

    .NavButton::before {
        content: '';
        position: absolute;
        top: 50%;
        width: 144px;
        height: 144px;
        border: 1px solid white;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        transition: all .3s ease-in-out;
    }

    .NavButton:hover::before {
        color: black;
        fill: black;
        background-color: white;
        box-shadow: 0px 2px 15px 5px rgba(255,255,255,0.5);
    }

    .NavButton--prev {
        left: 1.5rem;
    }

    .NavButton--next {
        right: 1.5rem; 
    }

    .NavButton--prev::before {
        transform: translateX(-75%) translateY(-50%);
    }
    .NavButton--next::before {
        transform: translateX(-5%) translateY(-50%);
    }

    .NavButton > svg {
        position: relative;
        z-index: 1;
        transition: all .3s ease-in-out;
    }

    .NavButton--prev > svg {
        transform: translateX(-8px);
    }

    .NavButton--next > svg {
        transform: translateX(8px);
    }

    .NavButton--prev:hover > svg {
        transform: translateX(-16px);
    }

    .NavButton--next:hover > svg {
        transform: translateX(16px);
    }
    
    .NavButton:hover > svg > path {
        stroke: black;
    }

    .Button {
        @apply py-5 px-10 rounded-full;
        width: fit-content;
        font-family: 'Soulmaze', sans-serif;
        font-weight: bold;
        letter-spacing: 2.25px;
        text-transform: uppercase;
        background-color: rgba(255, 255, 255, 0.1);
        margin-top: 2rem;
        border: 1px solid white;
        transition: all .33s ease-in-out;
    }

    .Button:hover {
        background-color: white;
        box-shadow: 0px 2px 15px 5px rgba(255,255,255,0.5);
    }

    .Button--back {
        position: absolute;
        top: 0;
        left: 0;
        margin-top: 3.5rem;
        margin-left: 4rem;
        padding: 0;
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }

    .Button--back::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: white;
        width: 9px;
        height: 2px;
        transform: rotate(-45deg) translate(-1px, -6px);
    }

    .Button--back::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: white;
        width: 9px;
        height: 2px;
        transform: rotate(45deg) translate(-2px, 5px);
    }

    .Button--back:hover::before, 
    .Button--back:hover::after
    {
        background-color: black;
    }

</style>

