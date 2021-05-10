<template>
    <article 
        v-if="isDisplayed && !content.isFinished"
        class="rounded-lg flex flex-col items-center max-w-sm"
        :style="'bottom:' + content.position.bottom + '; left: ' + content.position.left">
        <p 
            v-if="content.parts[currentStep].paragraphs"
            v-html="content.parts[currentStep].paragraphs[currentParagraphStep]" />
        <button
            @click="updateCurrentParagraphStep()"
            @mouseenter="hoverButton()"
            @mouseleave="hoverButton()"
            class="Button">
            <span v-if="currentStep === 0">{{ !isLastParagraphStep ? 'SUITE' : 'C\'EST PARTI' }}</span>
            <span v-else>{{ !isLastParagraphStep ? 'SUITE' : 'DÉCOUVRIR' }}</span>
        </button>
    </article>
</template>

<script lang="ts">
import EventBus from '../../assets/js/utils/EventBus'
import { UIEvents, GLEvents, AnimationEvents } from '../../assets/js/utils/Events'

export default {
    props: {
        isDisplayed: {
            type: Boolean,
            default: false
        },
        content: {
            type: Object,
            default: () => {}
        }
    },

    data: () => ({
        currentStep: 0,
        currentParagraphStep: 0,
        isFinished: false
    }),

    mounted () {
        EventBus.on<boolean>(UIEvents.RESET_PLANET_DIALOG, () => {
            this.currentStep = 0
            this.currentParagraphStep = 0
            this.content.isFinished = false
        })
    },

    computed: {
        maxStep () {
            return this.content.parts.length - 1
        },

        maxParagraphStep () {
            return this.content.parts[this.currentStep].paragraphs.length - 1
        },

        isLastParagraphStep () {
            return this.currentParagraphStep === this.maxParagraphStep
        }
    },

    methods: {
        updateCurrentParagraphStep () {
            if (this.currentParagraphStep + 1 > this.maxParagraphStep) {
                if (this.currentStep + 1 > this.maxStep) {
                    this.content.isFinished = true
                    EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
                    EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                    this.$emit('update:is-displayed', false)
                    return
                }
                this.currentStep++
                this.currentParagraphStep = 0
                EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
                EventBus.emit(GLEvents.SETUP_SCENERY_INTERACTION)
                EventBus.emit(UIEvents.RELAUNCH_ROCK_ANIMATION)
                this.$emit('update:is-displayed', false)
                return
            }

            this.currentParagraphStep++
        },
        hoverButton() {
            EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
        }
    }

}

</script>

<style scoped>
    article {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 500px;
        height: fit-content;
        padding: 2rem 2rem;
        background-color: white;
        color: black;
        font-size: 16px;
        text-align: center;
        line-height: 1.75;
    }

    article:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 3rem;
        width: 0;
        height: 0;
        border: 20px solid transparent;
        border-top-color: white;
        border-bottom: 0;
        border-left: 0;
        margin-left: -10px;
        margin-bottom: -20px;
    }

    button {
        cursor: none;
    }

    button:focus {
        outline: none;
    }

    .Button {
        @apply py-3 px-10 rounded-full;
        width: fit-content;
        font-family: 'Soulmaze', sans-serif;
        letter-spacing: 2.25px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2.25px;
        margin-top: 2rem;
        border: 1px solid black;
        transition: all .33s ease-in-out;
    }

    .Button:hover {
        color: white;
        background-color: black;
        box-shadow: 0px 2px 15px 5px rgba(0,0,0,0.5);
    }
</style>
