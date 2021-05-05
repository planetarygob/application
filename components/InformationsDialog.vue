<template>
    <div
        v-if="content"
        class="flex flex-col absolute bg-white w-1/5 rounded-xl justify-center items-center p-8"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
        @click="$emit('update:is-displayed', false)">
        <img 
            v-if="content.image"
            :src="`/images/${content.image.name}.png`"
            width="90px"
            height="90px">
        <h2
            v-if="content.title"
            class="mt-4">
            {{ content.title }}
        </h2>
        <span 
            v-if="content.text"
            class="mt-4 text-center"
            v-html="content.text" />
        <button
            v-if="content.action"
            @click="$emit('update:is-displayed', false)"
            class="mt-8 w-32 bg-#201838 text-white font-bold hover:text-black hover:bg-white hover:border-black py-2 px-4 rounded-full">
            <span>{{ content.action }}</span>
            <svg-icon
                svg-name="back"
                :width="32"
                :height="32"
                color="#FFFFFF"
                style="margin-top: 5px" />
        </button>
    </div>
</template>

<script>

import SvgIcon from './SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { GLEvents } from '../assets/js/utils/Events'

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
    }
}
</script>

<style>

</style>