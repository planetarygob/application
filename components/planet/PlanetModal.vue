<template>
    <section v-if="isDisplayed && content">
        <div class="wrapper">
            <div 
                class="img img--header"
                v-if="content.headerImage"
                :style="{ backgroundImage: `${ 'url(' + content.headerImage.url + ')' }`  }">
            </div>
            
            <div class="container container--regular">
                <div class="text-content">
                    <h2 v-if="content.titles">{{ content.titles[0] }}</h2>
                    <p 
                        v-if="content.paragraphs" 
                        v-html="content.paragraphs[0]" />
                </div>
                <img 
                    v-if="content.images" 
                    class="mt-56" 
                    :src="content.images[0].url" 
                    alt="">
            </div>

            <div class="container container--large">
                <img class="video" :src="content.videoImage.url" alt="">
                <!-- <iframe
                    v-if="content.video" class="video" 
                    :src="content.video.url + 'controls=0'" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe> -->
                <div class="text-content ml-32 my-auto">
                    <h2 v-if="content.titles">{{ content.titles[1] }}</h2>
                    <p 
                        v-if="content.paragraphs" 
                        v-html="content.paragraphs[1]" />
                </div>
            </div>

            <img 
                v-if="content.pannelImage" 
                :src="content.pannelImage.url" 
                class="img--pannel" 
                alt="">
           
            <div class="container container--regular flex items-end">
                <div class="text-content">
                    <h2 v-if="content.titles">{{ content.titles[2] }}</h2>
                    <p 
                        v-if="content.paragraphs" 
                        v-html="content.paragraphs[2]" />
                </div>
                <div class="text-content">
                    <p 
                        v-if="content.paragraphs" 
                        v-html="content.paragraphs[3]" />
                </div>
            </div>

            <button class="Button"
                @click="close()"
                @mouseenter="hoverButton()"
                @mouseleave="hoverButton()">
                Terminer la lecture
            </button>
        </div>
        <div class="ui-gradient ui-gradient--bot"></div>
    </section>
</template>

<script lang="ts">
import EventBus from '../../assets/js/utils/EventBus'
import { AnimationEvents, UIEvents, SoundEvents } from '../../assets/js/utils/Events'

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

    methods: {
        close() {
            this.$emit('update:is-displayed', false)
            EventBus.emit(SoundEvents.STOP_SOUND_SCENERY)
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
    section {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0F0A1F;
        color: white;
        overflow-y: scroll;
    }

    .ui-gradient {
        position: sticky;
        z-index: 2;
        left: 0;
        background: linear-gradient(#0F0A1F, #ffffff00);
        width: 100%;
        height: 10rem;
        pointer-events: none;
    }

    .ui-gradient--top {
        top: -1rem;
    }

    .ui-gradient--bot {
        bottom: -1rem;
        transform: rotate(180deg);
    }

    .wrapper {
        position: relative;
        padding: 2rem 4rem;
    }

    .container {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: fit-content;
        margin: 8rem auto;
    }

    .container--regular {
        max-width: 1000px;
    }

    .container--large {
        max-width: 1220px;
    }

    .container--noym {
        margin-top: 0;
        margin-bottom: 0;
    }

    h2 {
        position: relative;
        z-index: 1;
        font-weight: bold;
        font-family: 'Soulmaze', sans-serif;
        letter-spacing: 2.25px;
        text-transform: uppercase;
        font-size: 36px;
        margin-bottom: 3rem;
    }

    .text-content {
        height: fit-content;
        width: calc(50% - 2rem);
    }

    .text-content > p {
        margin-top: auto;
        margin-bottom: 1rem;
    }

    .img--header {
        position: absolute;
        z-index: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: right;
    }

    .img--pannel {
        max-width: none;
        width: calc(100% + 8rem);
        transform: translateX(-4rem);
    }

    .video {
        width: 650px;
        border-radius: 24px;
    }

    button {
        cursor: none;
    }

    .Button {
        @apply py-5 px-10 rounded-full;
        display: block;
        width: fit-content;
        font-family: 'Soulmaze', sans-serif;
        letter-spacing: 2.25px;
        font-weight: bold;
        text-transform: uppercase;
        background-color: rgba(255, 255, 255, 0.1);
        margin: auto;
        border: 1px solid white;
        transition: all .33s ease-in-out;
    }

    .Button:hover {
        color: black;
        background-color: white;
        box-shadow: 0px 2px 15px 5px rgba(255,255,255,0.5);
    }

</style>
