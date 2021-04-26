<template>
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
            <button @click="$emit('update:is-displayed', false)">Terminer la lecture</button>
        </div>
        <div class="ui-gradient ui-gradient--bot"></div>
    </section>
</template>

<script lang="ts">

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
    }
}

</script>

<style scoped>
    section {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 80%;
        height: calc(100% - 8rem);
        border-radius: 2rem;
        background: #26272b;
        color: white;
        overflow-y: scroll;
    }

    .ui-gradient {
        position: sticky;
        left: 0;
        background: linear-gradient(#26272b, #9198e500);
        width: 100%;
        height: 10rem;
    }

    .ui-gradient--top {
        top: -1rem;
    }

    .ui-gradient--bot {
        bottom: -1rem;
        transform: rotate(180deg);
    }

    .wrapper {
        padding: 2rem 4rem;
    }

    .container {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: fit-content;
        margin: 2rem auto;
    }

    h2 {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 32px;
    }

    .text-content {
        width: calc(50% - 2rem);
    }

    .text-content > p {
        margin-bottom: 1rem;
    }

    .img-content {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: calc(50% - 2rem);
    }

    .img {
        background-color: red;
        width: 50px;
        height: 50px;
        border-radius: 1rem;
    }

    .img--large {
        width: 100%;
        height: calc(100%/3*2 - 1rem);
    }
    
    .img--small {
        width: calc(50% - .5rem);
        height: calc(100%/3);
        align-self: flex-end;
    }

    .video {
        background-color: blue;
        width: 100%;
        height: 300px;
        border-radius: 1rem;
    }

    button {
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
