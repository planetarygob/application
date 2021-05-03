<template>
    <article 
        v-if="isDisplayed && !content.isFinished"
        class="rounded-lg flex flex-col items-center max-w-sm"
        :style="'top:' + content.position.top + '; left: ' + content.position.left">
        <p 
            v-if="content.parts[currentStep].paragraphs"
            v-html="content.parts[currentStep].paragraphs[currentParagraphStep]" />
        <button
            @click="updateCurrentParagraphStep()"
            class="mt-5 w-32 bg-#26272b text-white font-bold hover:text-black hover:bg-white hover:border-black py-2 px-4 border border-white rounded-full">
            {{ !isLastParagraphStep ? 'SUITE' : 'C\'EST PARTI' }}
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
                    EventBus.emit(UIEvents.SHOW_PLANET_MODAL, true)
                    this.$emit('update:is-displayed', false)
                    return
                }
                this.currentStep++
                this.currentParagraphStep = 0
                EventBus.emit(GLEvents.SETUP_SCENERY_INTERACTION)
                EventBus.emit(UIEvents.RELAUNCH_ROCK_ANIMATION)
                this.$emit('update:is-displayed', false)
                return
            }

            this.currentParagraphStep++
        }
    }

}

</script>

<style scoped>
    article {
        position: absolute;
        bottom: 0;
        left: 0;
        background-color: #26272b;
        color: white;
        font-size: .8em;
        line-height: 1.75;
        padding: 2rem 2rem;
        margin-bottom: 75px;
        cursor: default;
        border-left: 5px solid #7956b2;
        max-height: 210px;
    }
    
    p:before {
        content: "“";
        font-family: Georgia;
        font-size: 40px;
        line-height: 0;
        display: inline-block;
        display: -webkit-inline-box;
    }
</style>
