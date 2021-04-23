import { PMREMGenerator, WebGLRenderer, Scene } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import JSONSystems from '../../../datas/themes.json'

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
        for (let system of JSONSystems) {
            this.loadModel(system.sun, onError, onLoading, onAllLoaded, onModelLoaded)

            if (system.hasOwnProperty('planets')) {
                for (let planet of system.planets) {
                    if (planet.hasOwnProperty('object')) {
                        this.loadModel(planet.object, onError, onLoading, onAllLoaded, onModelLoaded)
                    }

                    if (planet.hasOwnProperty('scenery')) {
                        this.loadModel(planet.scenery, onError, onLoading, onAllLoaded, onModelLoaded)
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
        // console.log('modelToLoad.name', modelToLoad.name);
        // console.log('modelToLoad.url', modelToLoad.url);

        this.loader.load(
            modelToLoad.url,

            (gltf) => {
                gltf.userData = {type: modelToLoad.type, name: modelToLoad.name}
                this.modelsLoaded.set(modelToLoad.name, gltf)
                onModelLoaded(gltf)
                // todo: get the right number
                if (this.modelsLoaded.size === 16) {
                    onAllLoaded()
                }
            },

            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');s
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

    getGLTFInfos (key: string, parent = false) {
        console.log('key', key)
        if (key.includes('scenery')) {
            for (let system of JSONSystems) {
                if (system.sun.hasOwnProperty('planets')) {
                    let sceneryInfos = system.sun.planets.find(planet => planet.hasOwnProperty('scenery') && planet.scenery.name === key)
                    if (sceneryInfos) {
                        return sceneryInfos
                    }
                }
            }
        } else if (key.includes('object')) {
            for (let system of JSONSystems) {
                if (system.hasOwnProperty('planets')) {
                    let sceneryInfos = system.planets.find(planet => planet.hasOwnProperty('object') && planet.object.name === key)
                    if (sceneryInfos) {
                        return sceneryInfos
                    }
                }
            }
        } else if (key.includes('sun')) {
            if (parent) {
                return JSONSystems.find(system => system.sun.name === key)
            }

            for (let system of JSONSystems) {
                if (system.sun.name === key) {
                    return system.sun
                }
            }
        } else {
            return JSONSystems.find(system => system.name === key)
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