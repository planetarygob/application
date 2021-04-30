<template>
    <article 
        v-if="isDisplayed && !isFinished && content"
        class="rounded-lg flex flex-col items-center max-w-sm"
        :style="'top:' + content.position.top + '; left: ' + content.position.left">
        <p 
            v-if="content.paragraphs"
            v-html="content.paragraphs[currentStep]" />
        <button
            @click="updateCurrentStep()"
            class="mt-5 w-32 bg-#26272b text-white font-bold hover:text-black hover:bg-white hover:border-black py-2 px-4 border border-white rounded-full">
            {{ !isLastStep ? 'SUITE' : 'C\'EST PARTI' }}
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
        isFinished: false
    }),

    mounted () {
        EventBus.on<boolean>(UIEvents.RESET_PLANET_DIALOG, () => {
            this.currentStep = 0
            this.isFinished = false
        })
    },

    computed: {
        maxStep () {
            return this.content.paragraphs.length - 1
        },

        isLastStep () {
            return this.currentStep === this.maxStep
        }
    },

    methods: {
        updateCurrentStep () {
            if (this.currentStep + 1 > this.maxStep) {
                EventBus.emit(GLEvents.SETUP_SCENERY_INTERACTION)
                this.$emit('update:is-displayed', false)
                this.isFinished = true
            }

            this.currentStep++
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
