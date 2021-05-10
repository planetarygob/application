<template>
    <div>
        <div class="CustomCursor" v-bind:class="{ 'CustomCursor--button': isHoveringButton, 'CustomCursor--discover': isHoveringPlanet, 'CustomCursor--open': isHoveringTool, 'CustomCursor--grab': isMovingTool }">
            <div class="CustomCursor_main">
                <p>Découvrir</p>
                <img class="CustomCursor_openicon" src="https://florianblandin.fr/assets/images/icon-open-hand.svg" alt="grab icon">
                <img class="CustomCursor_grabicon" src="https://florianblandin.fr/assets/images/icon-grab-hand.svg" alt="grabbing icon">
            </div>
            
        </div>
        <div class="CustomCursor_follower"></div>
    </div>
</template>

<script lang="ts">
import gsap from 'gsap/all'
import EventBus from '~/assets/js/utils/EventBus'
import { UIEvents } from '~/assets/js/utils/Events'
import { lerp } from '~/assets/js/utils/Math'

export default {
    mounted() {

        const cursor = document.querySelector('.CustomCursor')
        const follower = document.querySelector('.CustomCursor_follower')
        let clientX = -100
        let clientY = -100
        let lastX = 0
        let lastY = 0

        document.addEventListener('pointermove', e => {
            clientX = e.clientX
            clientY = e.clientY
        })

        const render = () => {
            lastX = lerp(lastX, clientX, 0.2)
            lastY = lerp(lastY, clientY, 0.2)

            gsap.set(cursor, {
              x: clientX,
              y: clientY
            })

            gsap.set(follower, {
              x: lastX,
              y: lastY
            })
            requestAnimationFrame(render)
        }
        requestAnimationFrame(render)

        EventBus.on(UIEvents.TOGGLE_BUTTON_CURSOR, () => {
            this.isHoveringButton = !this.isHoveringButton
        })

        EventBus.on(UIEvents.TOGGLE_DISCOVER_CURSOR, () => {
            this.isHoveringPlanet = !this.isHoveringPlanet
        })

        EventBus.on(UIEvents.TOGGLE_OPEN_CURSOR, () => {
            this.isHoveringTool = !this.isHoveringTool
        })

        EventBus.on(UIEvents.TOGGLE_GRAB_CURSOR, () => {
            this.isMovingTool = !this.isMovingTool
        })
    },

    data: () => ({
        isHoveringPlanet: false,
        isHoveringButton: false,
        isHoveringTool: false,
        isMovingTool: false,
    }),

    methods: {
    }
}

</script>

<style scoped>

    .CustomCursor {
        position: fixed;
        z-index: 1000;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .CustomCursor_main {
        display: flex;
        width: 23px;
        height: 23px;
        border: 1px solid #A69FEE;
        border-radius: 50%;
        background-color: #A69FEE;
        transition: all .5s ease-in-out;
        transform: translate(-50%, -50%);
        transform-origin: center;
    }

    .CustomCursor_main > p {
        transform: translate(-50%, -50%);
        position: absolute;
        opacity: 0;
        top: 50%;
        left: 50%;
        text-transform: uppercase;
        font-size: 10px;
        font-weight: bold;
        color: white;
        transition: all .2s ease-in-out;
    }

    .CustomCursor_main > .CustomCursor_openicon,
    .CustomCursor_main > .CustomCursor_grabicon
    {
        margin: auto;
        opacity: 0;
        transform: scale(0) translate(calc(-50% - 1px), -50%);
        position: absolute;
        top: 50%;
        left: 50%;
        transition: all .5s ease-in-out;
        transform-origin: top left;
    }

    .CustomCursor--button > .CustomCursor_main {
        transform: scale(1.75);
        opacity: .5;
    }

    .CustomCursor--discover > .CustomCursor_main {
        width: 94px;
        height: 94px;
        background-color: rgba(166, 159, 238, .2);
    }

    .CustomCursor--open > .CustomCursor_main,
    .CustomCursor--grab > .CustomCursor_main
    {
        width: 58px;
        height: 58px;
        background-color: rgba(166, 159, 238, .2);
    }

    .CustomCursor--open > .CustomCursor_main > .CustomCursor_openicon
    {
        opacity: 1;
        transform: scale(1) translate(calc(-50% - 1px), -50%);
    }

    .CustomCursor--grab > .CustomCursor_main > .CustomCursor_grabicon
    {
        opacity: 1;
        transform: scale(1) translate(-50%, -50%);
    }

    .CustomCursor--discover > .CustomCursor_main > p {
        opacity: 1;
    }

    .CustomCursor_follower {
        position: absolute;
        pointer-events: none;
        top: 0;
        left: 0;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #A69FEE;
        opacity: 1;
        transition: opacity .3s ease-in-out;
    }

    .CustomCursor--button + .CustomCursor_follower,
    .CustomCursor--discover + .CustomCursor_follower,
    .CustomCursor--open + .CustomCursor_follower,
    .CustomCursor--grab + .CustomCursor_follower
    {
        opacity: 0;
    }
</style>
