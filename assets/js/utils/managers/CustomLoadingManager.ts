import { PMREMGenerator, WebGLRenderer, Scene } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import JSONModels from '../../../datas/themes.json'

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
        for (let modelToLoad of JSONModels) {
            if (modelToLoad.hasOwnProperty('bubbles')) {
                for (let bubble of modelToLoad.bubbles) {
                    this.loadModel(bubble, onError, onLoading, onAllLoaded, onModelLoaded)
                }
            }
            
            this.loadModel(modelToLoad, onError, onLoading, onAllLoaded, onModelLoaded)
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
                this.modelsLoaded.set(modelToLoad.name, gltf)
                onModelLoaded(gltf)
                if (this.modelsLoaded.size === 13) {
                    onAllLoaded()
                }
            },

            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
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
        let modelInfos = JSONModels.find(model => model.name === key)

        if (!modelInfos) {
            for (let model of JSONModels) {
                if (model.hasOwnProperty('bubbles')) {
                    modelInfos = model.bubbles.find(bubble => bubble.name === key)
                    if (modelInfos) {
                        return modelInfos
                    }
                }
            }
        }

        return modelInfos
    }

    getGLTFsByType (type: string) {
        if (!this.modelsLoaded.size) {
            throw new Error("models loaded are empty")
        }

        let gltfs: Map<string, GLTF> = new Map()
        for (const [key, value] of this.modelsLoaded) {
            let modelInfos = this.getGLTFInfos(key)

            if (modelInfos && modelInfos.type === type) {
                gltfs.set(key, value)
            }
        }

        if (!gltfs.size) {
            throw new Error("GLTFs " + name + " not loaded")
        }

        return gltfs
    }

}