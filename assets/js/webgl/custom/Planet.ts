import { Group, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import EventBus from "../../utils/EventBus";
import { GLEvents } from "../../utils/GLEvents";
import Renderer from "../core/Renderer";
import Scene from "../core/Scene";
import Bubble from "./Bubble";

class Planet extends Group {
    bubble: Bubble
    isComplete: boolean
    coords: Vector3

    constructor(
        scene: Scene,
        renderer: Renderer,
        coords: Vector3
    ) {
        super()
        this.coords = coords
        this.position.set(this.coords.x, this.coords.y, this.coords.z)
        this.isComplete = false
        // TODO : Is there no other solution than passing scene & renderer through all objects so that Bubble has access to it ?
        // TODO : Detect the change on this.isComplete pour dispose la Bulle
        this.bubble = new Bubble( 1, 12, scene, renderer )
        this.add( this.bubble.mesh )

        const loader = new GLTFLoader();

        loader.load( 'https://florianblandin.fr/assets/object_planet_hippie.gltf', ( gltf ) => {
            gltf.scene.scale.set(0.007, 0.007, 0.007)
            gltf.scene.position.y = -0.25
            this.add( gltf.scene )
        }, undefined, function ( error ) {
            console.error( error )
        })

        EventBus.on(GLEvents.UPDATE, (e: any) => this.update(e.elapsedTime))
        EventBus.on(GLEvents.CLICK, () => { this.isComplete ? this.isComplete = false : this.isComplete = true })
    }

    update( elapsedTime: number ) {
        if ( this.isComplete ) {
            // TODO : Talk with designers to be more precise about the movement we want the Bubbles to achieve
            this.position.set(
                this.coords.x * Math.cos( elapsedTime ),
                this.coords.y * Math.sin( elapsedTime ) * .3,
                this.coords.z * Math.sin( elapsedTime ),
            )
        } else {
            // TODO : Use initial position of Bubble / Planet instead of 0. Keep in mind it will be related to System coordinates & not Scene
            this.position.set(
                this.coords.x,
                this.coords.y * Math.sin( elapsedTime ) * 2 * Math.sin( elapsedTime ),
                this.coords.z,
            )
        }
    }
}

export default Planet
