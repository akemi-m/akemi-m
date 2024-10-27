import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

let scene, camera, renderer, composer, sphere, redLight;
let lightAngle = 0;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, 1200 / 544, 0.1, 1000);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(1200, 544);
  document.getElementById("container3D").appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(1200, 544),
    1.5,
    0.4,
    0.85
  );
  composer.addPass(bloomPass);

  const grainShader = {
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.05 },
    },
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float amount;
            varying vec2 vUv;
            float random(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                float grain = random(vUv + amount) * 0.1;
                gl_FragColor = color + vec4(vec3(grain), 0.0);
            }
        `,
  };
  const grainPass = new ShaderPass(grainShader);
  composer.addPass(grainPass);

  redLight = new THREE.PointLight(0xff0000, 7000, 10);
  redLight.position.set(5, 5, 0);
  scene.add(redLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 10);
  scene.add(ambientLight);

  const geometry = new THREE.SphereGeometry(1.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.7,
    metalness: 0.5,
  });
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  lightAngle += 0.01;
  const radius = 5;
  redLight.position.x = radius * Math.cos(lightAngle);
  redLight.position.z = Math.abs(radius * Math.sin(lightAngle));

  composer.render();
}

init();
