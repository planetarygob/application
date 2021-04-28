<!-- <template>
    <section v-if="isDisplayed && content">
        <div class="ui-gradient ui-gradient--top"></div>
        <div class="wrapper">
            <h2 v-if="content.title">{{ content.title }}</h2>
            <div class="container">
                <div 
                    v-if="content.paragraphs"
                    class="text-content">
                    <p v-html="content.paragraphs[0]" />
                </div>
                <div
                    v-if="content.images"
                    class="img-content">
                    <div
                        v-for="(image, index) in content.images"
                        :key="'image' + index"
                        class="img"
                        :class="'img--' + image.type"></div>
                </div>
            </div>
            <div
                v-if="content.videos"
                class="container">
                <div
                    v-for="(video, index) in content.videos"
                    :key="'video' + index"
                    class="video" />
            </div>
            <div class="container">
                <div class="text-content">
                    <p v-html="content.paragraphs[1]" />
                </div>
                <div class="text-content">
                    <p v-html="content.paragraphs[2]" />
                </div>
            </div>
            <button @click="close()">Terminer la lecture</button>
        </div>
        <div class="ui-gradient ui-gradient--bot"></div>
    </section>
</template> -->

<template>
    <section v-if="isDisplayed && content">
        <div class="wrapper">
            <div 
                class="img img--header"
                v-if="content.headerImage"
                v-bind:style="{ backgroundImage: `${ 'url(' + content.headerImage.url + ')' }`  }">
            </div>
            
            <div class="container container--regular">
                <div class="text-content">
                    <h2 v-if="content.titles">{{ content.titles[0] }}</h2>
                    <p v-if="content.paragraphs" v-html="content.paragraphs[0]" />
                </div>
                <img v-if="content.images" class="mt-56" :src="content.images[0].url" alt="">
            </div>

            <div class="container container--large">
                <iframe v-if="content.video" class="video" :src="content.video.url + 'controls=0'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <div class="text-content ml-32 my-auto">
                    <h2 v-if="content.titles">{{ content.titles[1] }}</h2>
                    <p v-if="content.paragraphs" v-html="content.paragraphs[1]" />
                </div>
            </div>

            <img v-if="content.pannelImage" class="img--pannel" :src="content.pannelImage.url" alt="">
           
            <div class="container container--regular flex items-end">
                <div class="text-content">
                    <h2 v-if="content.titles">{{ content.titles[2] }}</h2>
                    <p v-if="content.paragraphs" v-html="content.paragraphs[2]" />
                </div>
                <div class="text-content">
                    <p v-if="content.paragraphs" v-html="content.paragraphs[3]" />
                </div>
            </div>

            <button @click="close()">Terminer la lecture</button>
        </div>
        <div class="ui-gradient ui-gradient--bot"></div>
    </section>
</template>

<script lang="ts">
import EventBus from '../assets/js/utils/EventBus'
import { AnimationEvents } from '../assets/js/utils/Events'

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
            EventBus.emit(AnimationEvents.BACK)
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
        height: 485px;
        border-radius: 1rem;
    }

    button {
        position: relative;
        z-index: 1;
        text-transform: uppercase;
        font-weight: bold;
        padding: .5rem 2rem;
        border: 1px solid white;
        border-radius: 2rem;
        margin: auto;
        width: fit-content;
        display: block;
    }
</style>
