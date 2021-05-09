<template>
    <div
        v-show="isDisplayed"
        class="ProgressBar">
        <div class="ProgressBar_wrapper">

            <div class="ProgressBar_container">
                <!-- BEGINNING OF REPEATABLE ELEMENT, CREATE NEW ONE FOR EACH SYSTEM IN EXPERIENCE -->
                <!-- NOTE : Maybe we could use a isAvailable property in system so we don't create a tracker in the ProgressBar for unavailable sytem -->
                <div
                    v-for="(system, index) in systemsFiltered"
                    :key="'system' + index"
                    :class="`ProgressBar_system ProgressBar_system--${system.name}`">
                    <!-- USE SYSTEM NAME FOR TEXT -->
                    <p class="ProgressBar_name">{{ system.progressBarTitle }}</p>
                    <!-- USE SYSTEM NAME FOR MODIFIER CLASS -->
                    <div :class="`ProgressBar_progress ProgressBar_progress--${system.name}`">
                        <!-- CREATE A NODE + SEPARATOR FOR EACH ITEM IN SYSTEM.PLANETS -->
                        <!-- WARNING : Avoid creating a seperator for last item -->
                        <div class="ProgressBar_node" />
                        <div class="ProgressBar_separator" />
                        <div class="ProgressBar_node" />
                        <div class="ProgressBar_separator" />
                        <div class="ProgressBar_node" />
                    </div>
                </div>
            </div>
            
            <div
                @click="goQuiz"
                class="ProgressBar_quiz">
                <img 
                    class="ProgressBar_img" 
                    src="https://florianblandin.fr/assets/images/quiz.png" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import gsap from 'gsap/all'
import EventBus from '~/assets/js/utils/EventBus'
import { ProgressBarEvents, UIEvents, GLEvents } from '~/assets/js/utils/Events'
import JSONSystems from '../assets/datas/themes.json'

export default {
    props: {
        content: {
            type: Object,
            default: () => {}
        },
        isDisplayed: {
            type: Boolean,
            default: true
        }
    },

    data: () => ({
        quiz: null,
        systems: [],
        JSONSystems,
    }),

    computed: {
        systemsFiltered () {
            return this.JSONSystems.filter(system => system.teasing.title !== 'LA STATION SPATIALE')
        }
    },

    // TODO : Maybe nitiate it only when bigbang animation is done
    mounted() {
        gsap.to(document.querySelector('.ProgressBar'), {
            opacity: 1,
            duration: .5
        })

        EventBus.on(ProgressBarEvents.UPDATE_PROGRESS_BAR, (e: any) => this.update(e.name, e.index))

        EventBus.on<string>(ProgressBarEvents.SHOW_SELECTED_SYSTEM, (name) => {

            if (!this.systems.length && !this.quiz) {
                this.systems = document.querySelectorAll('.ProgressBar_system')
                this.quiz = document.querySelector('.ProgressBar_quiz')
            }
            
            if (name !== undefined) {
                this.showSelectedSystem(name)
            }
        })
        
        EventBus.on(ProgressBarEvents.SHOW_ALL_SYSTEMS, () => {
            this.showAllSystems()
        })
    },

    methods: {
        update(system: string, index: number) {            
            // NOTE : We select DOM element of concerned system
            const parent = document.querySelector(`.ProgressBar_progress--${ system }`)
            let systemNodes: any[] = []

            if (parent) {
                const children = parent.children

                // NOTE : We use this method to avoid selecting .ProgressBar_separator in odd positions
                for (let i = 0; i < children.length; i++) {
                    if(i % 2 === 0) {
                        systemNodes.push(children[i])
                    }
                }

                // NOTE : We finally use this to select & indicate as completed the planet we finished
                systemNodes[index].classList.add('ProgressBar_node--active')

                // NOTE : We check all completed nodes of the system
                const systemNodesCompleted = parent.querySelectorAll('.ProgressBar_node--active')

                // NOTE : We check if we juste completed the last node of the concerned system
                if (systemNodesCompleted.length === systemNodes.length) {
                    EventBus.emit(UIEvents.SHOW_INFORMATIONS_DIALOG, {
                        visible: true,
                        content: {
                            name: "congrats",
                            image: {
                                name: "congrats",
                                size: {
                                    width: "64px",
                                    height: "64px"
                                }
                            },
                            title: "BRAVO !",
                            text: "Tu as réussi à remettre les 3 planètes en orbite. Merci pour ton aide, tu peux dès à présent découvrir un autre système.",
                            action: "Continuer"
                        }
                    })
                }
            }

            gsap.to(document.querySelector('.ProgressBar_img'), {
                // NOTE : We divide it by 100 in order to convert percentage of completion to opacity value
                opacity: this.getCompletion() / 100
            })
        },

        getCompletion(): number {
            const allNodes = document.querySelectorAll('.ProgressBar_node')
            const completedNodes = document.querySelectorAll('.ProgressBar_node--active')
            const completion = Math.round((completedNodes.length / allNodes.length) * 100)

            return completion
        },

        // NOTE : Use this method when going into system view
        showSelectedSystem(name: string) {
            for (let i = 0; i < this.systems.length; i++) {
                if (!this.systems[i].classList.contains(`ProgressBar_system--${ name }`) && this.quiz) {
                    this.systems[i].classList.add('hidden')
                    this.quiz.classList.add('hidden')
                }
            }
        },

        // NOTE : Use this method when we go back to macro view
        showAllSystems () {
            for (let i = 0; i < this.systems.length; i++) {
                if (this.systems[i].classList.contains(`hidden`) && this.quiz) {
                    this.systems[i].classList.remove('hidden')
                    this.quiz.classList.remove('hidden')
                }
            }
        },

        goQuiz () {
            EventBus.emit(UIEvents.SHOW_INFORMATIONS_DIALOG, {
                visible: true,
                content: {
                    name: "locker",
                    image: {
                        name: "locker",
                        size: {
                            width: "32px",
                            height: "32px"
                        }
                    },
                    title: "ACCÈS BLOQUÉ",
                    text: "Pour débloquer l’accès à la station spatiale, tu dois parcourir toutes les planètes pour les remettre en orbite: ramène le plus d’informations possible!",
                    action: "Continuer"
                }
            })
        }
    }
}

</script>

<style scoped>
    .ProgressBar {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        width: fit-content;
        transform: translateX(-50%);
        color: white;
    }

    .ProgressBar_wrapper {
        display: flex;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4rem;
    }

    .ProgressBar_container {
        display: flex;
        margin: 0 2rem;
        padding: 1rem 0;
    }

    .ProgressBar_system {
        margin: 0 1rem;
    }

    .ProgressBar_name {
        text-align: center;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: 0.5rem;
    }

    .ProgressBar_progress {
        display: flex;
    }

    .ProgressBar_node {
        width: 12px;
        height: 12px;
        border: 1px solid white;
        border-radius: 50%;
    }

    .ProgressBar_node::after {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 50%;
        transition: transform .5s ease-in-out;
        transform-origin: center;
        transform: scale(0)
    }

    .ProgressBar_node--active::after {
        transform: scale(1)
    }

    .ProgressBar_separator {
        width: 14px;
        height: 1px;
        margin: auto;
        background-color: white;
        transform: translateY(-0.5px);
    }

    .ProgressBar_quiz {
        width: 72px;
        height: 72px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
    }

    .ProgressBar_img { 
        margin: auto;
        opacity: 0.05;
        margin-top: 20px;
    }
</style>
