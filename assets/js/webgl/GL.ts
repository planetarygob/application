import Scene from './core/Scene'
import { 
    Clock, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Raycaster, RGBFormat, ShaderMaterial, UniformsUtils, Vector2, Vector3, WebGLRenderTarget
} from 'three'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import { GLEvents } from '../utils/Events'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { BokehShader, BokehDepthShader } from 'three/examples/jsm/shaders/BokehShader2.js';
import GUI from '../utils/dev/GUI'

interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    scene: Scene
    clock: Clock
    size: Size
    canvas: HTMLCanvasElement
    isAnimationMixerRequired: boolean
    // ------------------------------ BLUR 2
    materialDepth: any
    distance: number
    effectController: any
    postprocessing: any
    shaderSettings: any

    mouse: any
    raycaster: any
    target: any
    planes: any
    leaves: number
    // ------------------------------

    constructor() {
        // ------------------------------ BLUR
        
        this.mouse = new Vector2();
		this.raycaster = new Raycaster();
		this.target = new Vector3( 0, 20, - 50 );
		this.planes = [];
		this.leaves = 100;
        
        this.distance = 100
        this.postprocessing = {
            enabled: true
        }
        this.effectController = {
            enabled: true,
            jsDepthCalculation: true,
            shaderFocus: false,

            fstop: 2.2,
            maxblur: 1.0,

            showFocus: false,
            focalDepth: 2.8,
            manualdof: false,
            vignetting: false,
            depthblur: false,

            threshold: 0.5,
            gain: 2.0,
            bias: 0.5,
            fringe: 0.7,

            // TODO : set it on camera creation too
            focalLength: 15,
            noise: true,
            pentagon: false,

            dithering: 0.0001
        }
        this.shaderSettings = {
            rings: 6,
            samples: 6
        }
        // ------------------------------

        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.scene = new Scene(this.canvas, this.size)
        this.scene.camera.setFocalLength( this.effectController.focalLength )
        this.clock = new Clock()
        this.isAnimationMixerRequired = false

        this.listenEvents()
        
        this.init()
        this.animate()
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL();
        }
 
        return GL.instance;
    }

    // ---------------- METHODS

    listenEvents() {
        window.addEventListener('resize', this.resize.bind(this))
        EventBus.on<boolean>(GLEvents.ANIMATION_MIXER_REQUIRED, (required) => {
            if (required !== undefined) {
                this.isAnimationMixerRequired = required
            }
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.scene.camera.aspect = this.size.width / this.size.height
        this.scene.camera.updateProjectionMatrix()

        this.scene.renderer.setSize( this.size.width, this.size.height )

        this.postprocessing.rtTextureDepth.setSize( window.innerWidth, window.innerHeight );
        this.postprocessing.rtTextureColor.setSize( window.innerWidth, window.innerHeight );

        this.postprocessing.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth;
        this.postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight;
    }

    // ------------------------------ BLUR

    init() {
        const depthShader = BokehDepthShader

        this.materialDepth = new ShaderMaterial( {
            uniforms: depthShader.uniforms,
            vertexShader: depthShader.vertexShader,
            fragmentShader: depthShader.fragmentShader
        } )

        this.materialDepth.uniforms[ 'mNear' ].value = this.scene.camera.near;
        this.materialDepth.uniforms[ 'mFar' ].value = this.scene.camera.far;

        this.scene.canvas.style.touchAction = 'none';
        this.scene.canvas.addEventListener( 'pointermove', this.onPointerMove.bind(this) )

        this.initPostprocessing()
        this.initGui()
    }

    initPostprocessing() {
        this.postprocessing.scene = this.scene
        this.postprocessing.camera = new OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000 );
        this.postprocessing.camera.position.z = 100;

        this.postprocessing.scene.add( this.postprocessing.camera );

        const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat };
        this.postprocessing.rtTextureDepth = new WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
        this.postprocessing.rtTextureColor = new WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

        const bokeh_shader = BokehShader;

        this.postprocessing.bokeh_uniforms = UniformsUtils.clone( bokeh_shader.uniforms );

        this.postprocessing.bokeh_uniforms[ 'tColor' ].value = this.postprocessing.rtTextureColor.texture;
        this.postprocessing.bokeh_uniforms[ 'tDepth' ].value = this.postprocessing.rtTextureDepth.texture;
        this.postprocessing.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth;
        this.postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight;

        this.postprocessing.materialBokeh = new ShaderMaterial( {

            uniforms: this.postprocessing.bokeh_uniforms,
            vertexShader: bokeh_shader.vertexShader,
            fragmentShader: bokeh_shader.fragmentShader,
            defines: {
                RINGS: this.shaderSettings.rings,
                SAMPLES: this.shaderSettings.samples
            }

        } );

        this.postprocessing.quad = new Mesh( new PlaneGeometry( window.innerWidth, window.innerHeight ), this.postprocessing.materialBokeh );
        this.postprocessing.quad.position.z = - 500;
        this.postprocessing.scene.add( this.postprocessing.quad );
    }

    matChanger() {
        for ( const e in this.effectController ) {
            if ( e in this.postprocessing.bokeh_uniforms ) {
                this.postprocessing.bokeh_uniforms[ e ].value = this.effectController[ e ];
            }
        }

        this.postprocessing.enabled = this.effectController.enabled;
        this.postprocessing.bokeh_uniforms[ 'znear' ].value = this.scene.camera.near;
        this.postprocessing.bokeh_uniforms[ 'zfar' ].value = this.scene.camera.far;
        this.scene.camera.setFocalLength( this.effectController.focalLength );
    }

    shaderUpdate() {
        this.postprocessing.materialBokeh.defines.RINGS = this.shaderSettings.rings;
        this.postprocessing.materialBokeh.defines.SAMPLES = this.shaderSettings.samples;
        this.postprocessing.materialBokeh.needsUpdate = true;
    }

    initGui() {
        GUI.add( this.effectController, 'enabled' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'jsDepthCalculation' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'shaderFocus' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'focalDepth', 0.0, 200.0 ).listen().onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'fstop', 0.1, 22, 0.001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'maxblur', 0.0, 5.0, 0.025 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'showFocus' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'manualdof' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'vignetting' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'depthblur' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'threshold', 0, 1, 0.001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'gain', 0, 100, 0.001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'bias', 0, 3, 0.001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'fringe', 0, 5, 0.001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'focalLength', 0, 80, 1 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'noise' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'dithering', 0, 0.001, 0.0001 ).onChange( this.matChanger.bind(this) );
        GUI.add( this.effectController, 'pentagon' ).onChange( this.matChanger.bind(this) );
        GUI.add( this.shaderSettings, 'rings', 1, 8 ).step( 1 ).onChange( this.shaderUpdate.bind(this) );
        GUI.add( this.shaderSettings, 'samples', 1, 13 ).step( 1 ).onChange( this.shaderUpdate.bind(this) );

        this.matChanger.bind(this)
    }

    onPointerMove( event ) {

        if ( event.isPrimary === false ) return;

        this.mouse.x = ( event.clientX - ( this.size.width/2 ) ) / ( this.size.width/2 );
        this.mouse.y = - ( event.clientY - ( this.size.height/2 ) ) / ( this.size.height/2 );

        this.postprocessing.bokeh_uniforms[ 'focusCoords' ].value.set( event.clientX / this.size.width, 1 - ( event.clientY / this.size.height ) )

        // NOTE : Logs values between 0 & 1
        // console.log("COORDS MOUSEOVER", event.clientX / this.size.width, 1 - ( event.clientY / this.size.height ))
    }

    linearize( depth ) {
        const zfar = this.scene.camera.far;
        const znear = this.scene.camera.near;
        return - zfar * znear / ( depth * ( zfar - znear ) - zfar );
    }

    smoothstep( near, far, depth ) {
        const x = this.saturate( ( depth - near ) / ( far - near ) );
        return x * x * ( 3 - 2 * x );
    }

    saturate( x ) {
        return Math.max( 0, Math.min( 1, x ) );
    }
    
    // ------------------------------

    // ---------------- LIFECYCLE
    // TODO : Rework so that we're not dependent of the user's framerate

    animate() {
        Stats.begin()

        window.requestAnimationFrame(this.animate.bind(this))
        this.render()

        Stats.end()
    }

    render() {
        if (this.clock) {
            EventBus.emit(GLEvents.UPDATE, {
                elapsedTime: this.clock.getElapsedTime() 
            })
        }

        if (this.isAnimationMixerRequired) {
            EventBus.emit(GLEvents.UPDATE_ANIMATION_MIXER, 1/60)
        }

        if ( this.effectController.jsDepthCalculation ) {

            this.raycaster.setFromCamera( this.mouse, this.scene.camera );

            const intersects = this.raycaster.intersectObjects( this.scene.children, true );
            const targetDistance = ( intersects.length > 0 ) ? intersects[ 0 ].distance : 1000;

            this.distance += ( targetDistance - this.distance ) * 0.03;

            const sdistance = this.smoothstep( this.scene.camera.near, this.scene.camera.far, this.distance );
            const ldistance = this.linearize( 1 - sdistance );

            this.postprocessing.bokeh_uniforms[ 'focalDepth' ].value = ldistance;
            this.effectController[ 'focalDepth' ] = ldistance;

        }

        if ( this.postprocessing.enabled ) {

            this.scene.renderer.clear();

            // render scene into texture

            this.scene.renderer.setRenderTarget( this.postprocessing.rtTextureColor );
            this.scene.renderer.clear();
            this.scene.renderer.render( this.scene, this.scene.camera );

            // render depth into texture

            this.scene.overrideMaterial = this.materialDepth;
            this.scene.renderer.setRenderTarget( this.postprocessing.rtTextureDepth );
            this.scene.renderer.clear();
            this.scene.renderer.render( this.scene, this.scene.camera );
            this.scene.overrideMaterial = null;

            // render bokeh composite
            this.scene.renderer.setRenderTarget( null );
            this.scene.renderer.render( this.postprocessing.scene, this.postprocessing.camera );

        } else {
            this.scene.overrideMaterial = null;

            this.scene.renderer.setRenderTarget( null );
            this.scene.renderer.clear();
            this.scene.renderer.render( this.scene, this.scene.camera );
        }
    }
}

export default GL