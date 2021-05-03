import { WebGLRenderer } from "three";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import JSONSystems from '../../../datas/themes.json'

export class CustomLoadingManager {
    private static instance: CustomLoadingManager
    loader: GLTFLoader
    modelsLoaded = new Map()
    loadedModels: number // NOTE : Helping on getting an overall tracking of the loading

    constructor (renderer: WebGLRenderer) {
        const ktx2Loader = new KTX2Loader()
            .setTranscoderPath('js/libs/basis/')
            .detectSupport(renderer);

        this.loadedModels = 0
        this.loader = new GLTFLoader()
        this.loader.setKTX2Loader(ktx2Loader);
        this.loader.setMeshoptDecoder(MeshoptDecoder);
    }

    static getInstance(renderer: WebGLRenderer): CustomLoadingManager {
        if (!CustomLoadingManager.instance) {
            CustomLoadingManager.instance = new CustomLoadingManager(renderer)
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

            if (system.hasOwnProperty('planets') && system.planets) {
                for (let planet of system.planets) {
                    if (planet.hasOwnProperty('object') && planet.object) {
                        this.loadModel(planet.object, onError, onLoading, onAllLoaded, onModelLoaded)
                    }

                    // wtf ts wants to have planet['scenery'] instead planet.scenery ??
                    if (planet.hasOwnProperty('scenery') && planet['scenery']) {
                        this.loadModel(planet['scenery'], onError, onLoading, onAllLoaded, onModelLoaded)

                        if (planet['scenery'].hasOwnProperty('character')) {
                            this.loadModel(planet['scenery'].character, onError, onLoading, onAllLoaded, onModelLoaded)
                        }
                    }
                }
            }
        }
    }

    loadModel(
        modelToLoad: { 
            url: string,
            type: string,
            name: string
        },
        onError: (error: ErrorEvent) => void,
        onLoading: (xhr: ProgressEvent<EventTarget>) => void,
        onAllLoaded: () => void,
        onModelLoaded: (gltf: GLTF) => void
    ) {
        if (modelToLoad.type !== 'character') {
            this.loader.setPath('https://florianblandin.fr/assets/')
        } else {
            this.loader.setPath('')
        }

        this.loader.load(
            modelToLoad.url,

            (gltf) => {
                gltf.userData = {type: modelToLoad.type, name: modelToLoad.name}
                this.modelsLoaded.set(modelToLoad.name, gltf)
                onModelLoaded(gltf)
                // TODO: get the right number
                if (this.modelsLoaded.size === 19) {
                    onAllLoaded()
                }
            },

            function (xhr) {
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
        if (key.includes('object')) {
            for (let system of JSONSystems) {
                if (system.hasOwnProperty('planets') && system.planets) {
                    let objectInfos = system.planets.find((planet: {object: {name: string}}) => planet.hasOwnProperty('object') && planet.object.name === key)
                    if (objectInfos) {
                        return objectInfos
                    }
                }
            }
        } else if (key.includes('planet')) {
            for (let system of JSONSystems) {
                if (system.hasOwnProperty('planets') && system.planets) {
                    let planetInfos = system.planets.find((planet: {name: string, type: string}) => planet.name === key)
                    if (planetInfos) {
                        return planetInfos
                    }
                }
            }
        } else if (key.includes('sun')) {
            if (parent) {
                return JSONSystems.find((system: { sun: {name: string}}) => system.sun.name === key)
            }

            for (let system of JSONSystems) {
                if (system.sun.name === key) {
                    return system.sun
                }
            }
        } else {
            return JSONSystems.find((system: {name: string}) => system.name === key)
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