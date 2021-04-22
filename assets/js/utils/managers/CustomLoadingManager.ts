import { PMREMGenerator, WebGLRenderer, Scene } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import JSONSuns from '../../../datas/themes.json'

export class CustomLoadingManager {
    private static instance: CustomLoadingManager
    loader: GLTFLoader
    modelsLoaded = new Map()

    constructor (renderer: WebGLRenderer, scene: Scene) {
        const environment = new RoomEnvironment();
        const pmremGenerator = new PMREMGenerator(renderer);

        scene.environment = pmremGenerator.fromScene(environment).texture;

        const ktx2Loader = new KTX2Loader()
            .setTranscoderPath('js/libs/basis/')
            .detectSupport(renderer);

        this.loader = new GLTFLoader().setPath('https://florianblandin.fr/assets/');
        this.loader.setKTX2Loader(ktx2Loader);
        this.loader.setMeshoptDecoder(MeshoptDecoder);
    }

    static getInstance(renderer: WebGLRenderer, scene: Scene): CustomLoadingManager {
        if (!CustomLoadingManager.instance) {
            CustomLoadingManager.instance = new CustomLoadingManager(renderer, scene)
        }
        return CustomLoadingManager.instance
    }

    loadAllModels(
        onError: (error: ErrorEvent) => void,
        onLoading: (xhr: ProgressEvent<EventTarget>) => void,
        onAllLoaded: () => void,
        onModelLoaded: (gltf: GLTF) => void
    ) {
        for (let sun of JSONSuns) {
            this.loadModel(sun, onError, onLoading, onAllLoaded, onModelLoaded)

            if (sun.hasOwnProperty('bubbles')) {
                for (let bubble of sun.bubbles) {
                    this.loadModel(bubble, onError, onLoading, onAllLoaded, onModelLoaded)

                    if (bubble.hasOwnProperty('scenery')) {
                        this.loadModel(bubble.scenery, onError, onLoading, onAllLoaded, onModelLoaded)
                    }
                }
            }
        }
    }

    loadModel(
        modelToLoad,
        onError: (error: ErrorEvent) => void,
        onLoading: (xhr: ProgressEvent<EventTarget>) => void,
        onAllLoaded: () => void,
        onModelLoaded: (gltf: GLTF) => void
    ) {
        this.loader.load(
            modelToLoad.url,

            (gltf) => {
                gltf.userData = {type: modelToLoad.type}
                this.modelsLoaded.set(modelToLoad.name, gltf)
                onModelLoaded(gltf)
                // todo: get the right number
                if (this.modelsLoaded.size === 16) {
                    onAllLoaded()
                }
            },

            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                onLoading(xhr)
            },

            function (error) {
                onError(error)
                console.log('An error happened', error);
            }
        )
    }

    getGLTFByName (name: string): GLTF {
        if (!this.modelsLoaded.size) {
            throw new Error("models loaded are empty")
        }

        const gltf = this.modelsLoaded.get(name)

        if (!gltf) {
            throw new Error("GLTF " + name + " not loaded")
        }
        
        return gltf
    }

    getGLTFInfos (key: string) {
        console.log('key', key)
        if (key.includes('scenery')) {
            for (let sun of JSONSuns) {
                if (sun.hasOwnProperty('bubbles')) {
                    let sceneryInfos = sun.bubbles.find(bubble => bubble.hasOwnProperty('scenery') && bubble.scenery.name === key)
                    if (sceneryInfos) {
                        return sceneryInfos
                    }
                }
            }
        } else if (key.includes('bubble')) {
            for (let sun of JSONSuns) {
                if (sun.hasOwnProperty('bubbles')) {
                    let bubbleInfos = sun.bubbles.find(bubble => bubble.name === key)
                    if (bubbleInfos) {
                        return bubbleInfos
                    }
                }
            }
        } else {
            return JSONSuns.find(sun => sun.name === key)
        }
    }

    getGLTFsByType (type: string) {
        if (!this.modelsLoaded.size) {
            throw new Error("models loaded are empty")
        }

        let gltfs: Map<string, GLTF> = new Map()
        for (const [key, value] of this.modelsLoaded) {
            if (value.userData.type === type) {
                gltfs.set(key, value)
            }
        }

        if (!gltfs.size) {
            throw new Error("GLTFs " + name + " not loaded")
        }

        return gltfs
    }

}