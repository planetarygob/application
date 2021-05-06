<template>
    <div
        v-if="content"
        class="flex flex-col absolute bg-white w-1/5 rounded-xl justify-center items-center p-8"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
        @click="$emit('update:is-displayed', false)">
        <img 
            v-if="content.image"
            :src="`/images/${content.image.name}.png`"
            :width="content.image.size.width"
            :height="content.image.size.height">
        <h2
            v-if="content.title"
            class="mt-4 font-black text-xl">
            {{ content.title }}
        </h2>
        <span 
            v-if="content.text"
            class="mt-4 text-center text-sm text-center"
            v-html="content.text" />
        <button
            v-if="content.action"
            class="mt-8 text-white font-bold hover:text-#201838 hover:bg-white py-2 rounded-full"
            style="background-color: #201838; padding-left: 1rem; padding-right: 0.5rem;"
            @click="back">
            <div class="flex flex-row">
                <span>{{ content.action }}</span>
                <img 
                    src="/images/button.png"
                    width="28px"
                    height="28px"
                    class="ml-6" />
            </div>
        </button>
    </div>
</template>

<script>

import SvgIcon from './SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { GLEvents, AnimationEvents } from '../assets/js/utils/Events'

export default {
    components: {
        SvgIcon
    },

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

    mounted () {
        EventBus.on(GLEvents.SCENE_CLICKED, () => {
            this.$emit('update:is-displayed', false)
        })
    },

    methods: {
        back () {
            this.$emit('update:is-displayed', false)
            EventBus.emit(AnimationEvents.BACK)
        }
    }
}
</script>

<style>

</style>