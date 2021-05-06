import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { Vector3, PointLight, AmbientLight, AnimationMixer, DirectionalLight } from "three"
import EventBus from "../../utils/EventBus"
import { GLEvents, AnimationEvents, UIEvents } from "../../utils/Events"
import GUI from "../../utils/dev/GUI"

class SceneryCharacter {
    name: string
    model: GLTF
    initialPosition: Vector3
    isAnimated: boolean

    constructor (
        name: string,
        model: GLTF,
        initialPosition: Vector3
    ) { 

        this.name = name
        this.model = model
        this.initialPosition = initialPosition

        const themeLight = new DirectionalLight('#ffffff', 1)
        themeLight.position.set(0, 70, 100)
        this.model.scene.add(themeLight)

        this.model.scene.visible = false

        this.model.scene.scale.set(4, 4, 4)
        this.model.scene.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)

        this.isAnimated = true
    }

    launchAnimation () {
        console.log('launchAnimation', );
        if (this.model.animations.length && this.isAnimated) {
            console.log('this.model.animations[0]', this.model.animations[0]);
            const animationMixer = new AnimationMixer(this.model.scene)
            const action = animationMixer.clipAction(this.model.animations[0])
            action.play()

            if (this.name === 'mode_scenery_rock_character') {
                setTimeout(() => {
                    action.paused = true
                }, 13000)
    
                EventBus.on(UIEvents.RELAUNCH_ROCK_ANIMATION, () => {
                    action.paused = false
                    setTimeout(() => {
                        action.paused = true
                        setTimeout(() => {
                            action.paused = false
                        }, 5000)
                    }, 3000)
                })

                // EventBus.on(UIEvents.ROCK_ANIMATION_IS_ENDED, () => {
                //     action.paused = false
                // })
            }

            EventBus.on(GLEvents.UPDATE_ANIMATION_MIXER, (deltaTime) => {
                animationMixer.update(deltaTime)
            })
        }
    }
}

export default SceneryCharacter
