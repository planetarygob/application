<template>
    <transition name="fade">
        <div
            v-if="content"
            class="container flex flex-col absolute bg-white w-1/5 rounded-xl justify-center items-center px-16 py-12"
            ref="informationsDialog"
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
            <p 
                v-if="content.text"
                class="mt-4 text-center text-sm text-center"
                v-html="content.text" />
            <button
                v-if="content.action"
                class="Button mt-12 text-white font-bold hover:text-#201838 hover:bg-white py-2 rounded-full"
                style="background-color: #201838; padding-left: 1rem; padding-right: 0.5rem;"
                @click="back"
                @mouseenter="hoverButton()"
                @mouseleave="hoverButton()">
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
    </transition>
</template>

<script>

import SvgIcon from './SvgIcon.vue'
import EventBus from '../assets/js/utils/EventBus'
import { GLEvents, AnimationEvents, UIEvents } from '../assets/js/utils/Events'
import gsap from 'gsap/all'

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
            EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
            EventBus.emit(AnimationEvents.BACK)
        },
        hoverButton() {
            EventBus.emit(UIEvents.TOGGLE_BUTTON_CURSOR)
        }
    }
}
</script>

<style scoped>

    .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
    }
    
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    }

    h2 {
        font-family: 'Soulmaze', sans-serif;
        letter-spacing: 2.25px;
    }
    
    .container {
        min-width: 500px;
    }

    button {
        cursor: none;
    }

    p {
        font-size: 18px;
    }
</style>