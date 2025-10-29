import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Import postprocessing essentials
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Postprocessing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add RGB Shift pass
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015; // Tweak as desired
composer.addPass(rgbShiftPass);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let model = null;

// Add HDRI environment
new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.background = texture;

    const loader = new GLTFLoader();
    loader.load(
      './DamagedHelmet.gltf',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
      },
      undefined,
      (error) => {
        console.error('An error happened loading the gltf model', error);
      }
    );
  });

// Attach OrbitControls


// Add some ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 6);
scene.add(ambientLight);

window.addEventListener("mousemove",(e)=>{
    if(model){
        const rotationX=(e.clientX/window.innerWidth -0.5)*Math.PI*0.18;
        const rotationY=(e.clientY/window.innerHeight -0.5)*Math.PI*0.18;
        gsap.to(model.rotation, { 
            x: rotationY, 
            y: rotationX, 
            duration: 0.5, 
            ease: "power2.out" 
        });
    }
})

function animate() {
  window.requestAnimationFrame(animate);

  // Optionally rotate the model
  // if (model) {
  //   model.rotation.y += 0.01;
  // }

 
  // Use composer instead of renderer.render for postprocessing
  composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
