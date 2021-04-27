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
    <section>
        <div class="wrapper">
            <div 
                class="img img--header"
                v-bind:style="{ backgroundImage: 'url(https://florianblandin.fr/assets/images/mode_jupe_big_1.jpg )'}">
            </div>
            
            
            <div class="container">
                <div class="text-content">
                    <h2>La minijupe</h2>
                    <p v-html="'Née dans les années 1960, la mini-jupe est devenue en France un symbole stylistique célébrant une femme affranchie des codes vestimentaires conservateurs. </br></br> Si aujourd\'hui on la croise sans qu\'elle ne fasse sourciller, il n\'en a pas toujours été ainsi. Lorsqu\'elle débarque sur le sol français en 1964, la mini-jupe est un OMNI (objet mode non-identifié) qui, s\'il séduit la jeunesse s\'attire rapidement les foudres des plus conservateurs. </br></br> Pour bien comprendre le bouleversement occasionné par ce petit bout de tissu, il faut rappeler qu\'à cette époque, les femmes portaient des jupes longues et que le comble de l\'indécence était de laisser apparaître un genou. Dans cette ère ultra-conservatrice, une femme a pourtant osé braver les interdits.'" />
                </div>
                <img class="" src="https://florianblandin.fr/assets/images/mode_jupe_small_1.jpg" alt="">
            </div>
            <div class="container">
                <!-- TODO: Upload video on FTP to easily customize -->
                <iframe class="video" src="https://www.youtube.com/embed/EztpFM3wjqU?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <div class="text-content">
                    <p v-html="'Elle s\'appelle Mary Quant. Elle est britannique et styliste de profession. Pour séduire les clientes de sa boutique, la jeune femme décide de raccourcir les jupes qu\'elle vend et d\'appeler sa création mini-jupe en référence, dit-on, à la voiture Mini dont elle raffole.'" />
                </div>
            </div>
            <div class="container">
                
                <div class="text-content">
                    <p v-html="'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.Amet minim mollit non deserunt ullamco est sit aliqua dolor.'" />
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
            default: true
        },
        content: {
            type: Object,
            default: () => {}
        }
    },

    methods: {
        close () {
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

    h2 {
        position: relative;
        z-index: 1;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 32px;
    }

    .text-content {
        width: calc(50% - 2rem);
        margin-left: 6rem;
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
        width: 50px;
        height: 50px;
    }

    .img--header {
        position: absolute;
        z-index: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: right;
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
        width: 650px;
        height: 485px;
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

    p {
        max-width: 55%;
    }
</style>
