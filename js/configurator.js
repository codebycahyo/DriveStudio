import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { debounce } from './utils.js';

let renderer, scene, camera, controls;
let bodyMaterial, cabinMaterial, glassMaterial, rimMaterial, rubberMaterial, stripesMesh, customDecalMesh;
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
let customDecalBaseWidth = 1, customDecalBaseHeight = 1;
let ambientLight, hemiLight, dirLight, spotRed, spotBlue;
let groundMaterial;

const DEFAULT_COLOR = '#F20E4B';

function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#090909');
  scene.fog = new THREE.Fog('#090909', 14, 22);
}

function createCamera(canvas) {
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(5, 3.2, 7);
  camera.lookAt(0, 0.6, 0);
}

function createRenderer(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true, // needed for screenshot
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();
}

function createControls(canvas) {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0.5, 0);
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI / 2.25; // prevent going under the ground
  controls.minPolarAngle = 0.3;
  controls.addEventListener('change', requestRender);
}

function requestRender() {
  if (renderer && scene && camera && !controls.autoRotate) {
    renderer.render(scene, camera);
  }
}

function buildCarModel(carId = 'toyota-innova-zenix') {
  const carGroup = new THREE.Group();
  carGroup.name = 'car';

  // Body material (paintable)
  bodyMaterial = new THREE.MeshStandardMaterial({
    color: DEFAULT_COLOR,
    metalness: 0.7,
    roughness: 0.25,
  });

  // Cabin material (slightly transparent, darker)
  cabinMaterial = new THREE.MeshStandardMaterial({
    color: DEFAULT_COLOR,
    metalness: 0.6,
    roughness: 0.3,
  });

  // Wheel material (dark rubber) - shared
  rubberMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    metalness: 0.15,
    roughness: 0.9,
  });

  // Glass material (module level)
  glassMaterial = new THREE.MeshStandardMaterial({
    color: '#1a2a3a',
    metalness: 0.9,
    roughness: 0.05,
    transparent: true,
    opacity: 0.35,
  });

  // Wheel rim material (module level)
  rimMaterial = new THREE.MeshStandardMaterial({
    color: '#888888',
    metalness: 0.9,
    roughness: 0.15,
  });

  // --- Livery Stripes (module level) ---
  const stripeGeom = new THREE.BoxGeometry(0.48, 0.02, 1.25);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.3,
  });
  stripesMesh = new THREE.Group();
  stripesMesh.name = 'livery';

  const stripeL = new THREE.Mesh(stripeGeom, stripeMat);
  stripeL.position.set(-0.315, 0.94, 1.575);
  stripesMesh.add(stripeL);

  const stripeR = stripeL.clone();
  stripeR.position.x = 0.315;
  stripesMesh.add(stripeR);

  stripesMesh.visible = false;
  carGroup.add(stripesMesh);

  // Custom user livery decal plane (side of the box for MBG_PICKUP)
  const decalGeom = new THREE.PlaneGeometry(1, 1);
  const decalMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false });
  customDecalMesh = new THREE.Mesh(decalGeom, decalMat);
  // Position it slightly off the left side of the truck box, centered on the box panel
  customDecalMesh.position.set(-0.95, 1.45, 1.3);
  customDecalMesh.rotation.y = -Math.PI / 2; // Face outward
  customDecalMesh.visible = false;
  carGroup.add(customDecalMesh);

  // --- Load imported Blender glb model as premium visual overlay ---
  const loadingIndicator = document.getElementById('stagePlaceholder');
  if (loadingIndicator) {
    loadingIndicator.classList.remove('is-hidden');
    const loadingText = loadingIndicator.querySelector('p');
    if (loadingText) loadingText.textContent = 'Memuat model mobil 3D premium...';
  }

  const loadGLB = (path, isFallback = false) => {
    gltfLoader.load(
      path,
      (gltf) => {
        // Clear procedural group
        const proc = carGroup.getObjectByName('procedural');
        if (proc) {
          carGroup.remove(proc);
        }

        // Remove any previous GLTF model to avoid duplicate rendering
        const prevModel = carGroup.getObjectByName('glbModel');
        if (prevModel) {
          prevModel.traverse((node) => {
            if (node.isMesh && node.geometry) {
              node.geometry.dispose();
            }
          });
          carGroup.remove(prevModel);
        }

        const model = gltf.scene;
        model.name = 'glbModel';

        // Fit and scale imported model to stage
        model.scale.set(0.9, 0.9, 0.9);
        model.position.set(0, 0, 0);

        // Traversal to bind and map custom materials dynamically
        model.traverse((node) => {
          if (node.name === 'Plane' || node.name === 'Plane.001' || node.name === 'Cube.001') {
            node.visible = false;
            return;
          }

          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Process multi-material groupings
            if (Array.isArray(node.material)) {
              node.material = node.material.map((mat) => {
                const matName = mat.name.toUpperCase();
                if (matName.includes('CARR') || matName.includes('PAINT')) return bodyMaterial;
                if (matName.includes('VD') || matName.includes('GLASS') || matName.includes('WINDSCREEN')) return glassMaterial;
                if (matName.includes('ALLOY') || matName.includes('RIM')) return rimMaterial;
                if (matName.includes('RUBBER') || matName.includes('PNEU')) {
                  return rubberMaterial;
                }
                return mat;
              });
            } else {
              const matName = node.material.name.toUpperCase();
              const nodeName = node.name.toUpperCase();

              // Strictly match by material names to avoid overriding interior/chassis parts
              if (matName.includes('CARR') || matName.includes('PAINT')) {
                node.material = bodyMaterial;
              } else if (matName.includes('VD') || matName.includes('GLASS') || matName.includes('WINDSCREEN')) {
                node.material = glassMaterial;
              } else if (matName.includes('ALLOY') || matName.includes('RIM')) {
                node.material = rimMaterial;
              } else if (matName.includes('RUBBER') || matName.includes('PNEU')) {
                node.material = rubberMaterial;
              }
            }
          }
        });

        carGroup.add(model);

        // Re-adjust livery coordinates slightly to sit on top of the imported model hood
        if (stripesMesh) {
          stripesMesh.position.set(0, 0.73, 0.45);
        }

        if (loadingIndicator) {
          loadingIndicator.classList.add('is-hidden');
        }
        requestRender();
      },
      (xhr) => {
        // Dynamic loading log
        const pct = Math.round((xhr.loaded / (xhr.total || 11136668)) * 100);
        const loadingText = loadingIndicator?.querySelector('p');
        if (loadingText) {
          loadingText.textContent = `Mengunduh data 3D: ${pct}%...`;
        }
      },
      (error) => {
        if (!isFallback) {
          loadGLB('assets/models/model.glb', true);
        } else {
          if (loadingIndicator) {
            loadingIndicator.classList.add('is-hidden');
          }
        }
      }
    );
  };

  // Only a single shared model ships today; load it directly instead of
  // probing a per-car path that always 404s before falling back.
  loadGLB('assets/models/model.glb', true);

  scene.add(carGroup);
}

function createGround() {
  const groundGeom = new THREE.CircleGeometry(14, 64);
  groundMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.3,
    roughness: 0.65,
  });
  const ground = new THREE.Mesh(groundGeom, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
}

function initLighting() {
  // Soft ambient fill
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Hemisphere light for natural sky/ground split
  hemiLight = new THREE.HemisphereLight(0x4488cc, 0x222222, 0.5);
  scene.add(hemiLight);

  // Key light — directional from front-above
  dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(4, 8, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 25;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  scene.add(dirLight);

  // Dramatic side spot (red tint, matching brand)
  spotRed = new THREE.SpotLight(0xff4444, 1.0, 20, Math.PI / 6, 0.5);
  spotRed.position.set(-6, 5, 2);
  spotRed.target.position.set(0, 0.5, 0);
  scene.add(spotRed);
  scene.add(spotRed.target);

  // Cool-toned fill from the other side
  spotBlue = new THREE.SpotLight(0x4488ff, 0.6, 20, Math.PI / 6, 0.5);
  spotBlue.position.set(6, 4, -3);
  spotBlue.target.position.set(0, 0.5, 0);
  scene.add(spotBlue);
  scene.add(spotBlue.target);
}

function onWindowResize() {
  const canvas = renderer.domElement;
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  requestRender();
}

const debouncedResize = debounce(onWindowResize, 100);

function animate() {
  requestAnimationFrame(animate);
  if (controls && controls.autoRotate) {
    controls.update();
    renderer.render(scene, camera);
  }
}

export function initConfigurator() {
  const canvas = document.getElementById('carCanvas');
  if (!canvas) return;

  const carUrlId = new URLSearchParams(window.location.search).get('car') || 'toyota-innova-zenix';

  createScene();
  createCamera(canvas);
  createRenderer(canvas);
  createControls(canvas);
  buildCarModel(carUrlId);
  createGround();
  initLighting();

  window.addEventListener('resize', debouncedResize);
  onWindowResize(); // match initial container size

  animate();
}

export function setBodyColor(hex) {
  const color = new THREE.Color(hex);
  if (bodyMaterial) bodyMaterial.color.copy(color);
  if (cabinMaterial) cabinMaterial.color.copy(color);
  requestRender();
}

export function setWheelsOption(opt) {
  if (!rimMaterial) return;
  if (opt === 'wheels-forged') {
    rimMaterial.color.set('#888888'); // Silver
    rimMaterial.roughness = 0.15;
  } else if (opt === 'wheels-carbon') {
    rimMaterial.color.set('#1c1c1c'); // Dark carbon
    rimMaterial.roughness = 0.8;
  } else if (opt === 'wheels-polished') {
    rimMaterial.color.set('#ddaa55'); // Gold/bronze
    rimMaterial.roughness = 0.2;
  }
  requestRender();
}

export function setGlassTint(opt) {
  if (!glassMaterial) return;
  if (opt === 'glass-clear') {
    glassMaterial.color.set('#1a2a3a');
    glassMaterial.opacity = 0.25;
  } else if (opt === 'glass-smoke') {
    glassMaterial.color.set('#0a0a0d');
    glassMaterial.opacity = 0.65;
  } else if (opt === 'midnight') {
    glassMaterial.color.set('#020202');
    glassMaterial.opacity = 0.92;
  }
  requestRender();
}

export function setLivery(opt) {
  if (!stripesMesh) return;
  if (opt === 'livery-clean') {
    stripesMesh.visible = false;
  } else if (opt === 'livery-stripes') {
    stripesMesh.visible = true;
    stripesMesh.children.forEach((mesh) => {
      mesh.material.color.set('#ffffff'); // White stripes
    });
  } else if (opt === 'livery-stealth') {
    stripesMesh.visible = true;
    stripesMesh.children.forEach((mesh) => {
      mesh.material.color.set('#ffc107'); // Amber Gold stripes
    });
  }
  requestRender();
}

export function setCustomLivery(url) {
  if (!customDecalMesh) return;
  // If no URL (reset to clean), hide the custom decal
  if (!url) {
    customDecalMesh.visible = false;
    return;
  }
  
  if (stripesMesh) stripesMesh.visible = false;

  textureLoader.load(url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Auto-scale to preserve aspect ratio and fit inside the box side (2.6w x 1.1h)
    const imgAspect = texture.image.width / texture.image.height;
    const maxWidth = 2.6;
    const maxHeight = 1.1;
    
    let finalWidth = maxWidth;
    let finalHeight = maxWidth / imgAspect;
    
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * imgAspect;
    }
    
    customDecalBaseWidth = finalWidth;
    customDecalBaseHeight = finalHeight;
    
    // Default scale is 1
    customDecalMesh.scale.set(finalWidth, finalHeight, 1);

    customDecalMesh.material.map = texture;
    customDecalMesh.material.needsUpdate = true;
    customDecalMesh.visible = true;
    requestRender();
  });
}

export function updateCustomLiveryTransform(scale, posX, posY) {
  if (!customDecalMesh) return;
  customDecalMesh.scale.set(customDecalBaseWidth * scale, customDecalBaseHeight * scale, 1);
  customDecalMesh.position.z = posX;
  customDecalMesh.position.y = posY;
  requestRender();
}

export function setEnvironment(opt) {
  if (!scene || !groundMaterial) return;
  if (opt === 'env-dark') {
    scene.background.set('#090909');
    scene.fog.color.set('#090909');
    groundMaterial.color.set('#111111');
    groundMaterial.roughness = 0.65;
  } else if (opt === 'env-neon') {
    scene.background.set('#0c0312');
    scene.fog.color.set('#0c0312');
    groundMaterial.color.set('#100718');
    groundMaterial.roughness = 0.22; // reflective wet look
  } else if (opt === 'env-white') {
    scene.background.set('#f0eff2');
    scene.fog.color.set('#f0eff2');
    groundMaterial.color.set('#ffffff');
    groundMaterial.roughness = 0.85;
  }
  requestRender();
}

export function setLighting(opt) {
  if (!ambientLight || !dirLight || !spotRed || !spotBlue) return;
  if (opt === 'light-dramatic') {
    ambientLight.intensity = 0.4;
    dirLight.intensity = 1.2;
    spotRed.color.set('#ff4444');
    spotRed.intensity = 1.0;
    spotBlue.color.set('#4488ff');
    spotBlue.intensity = 0.6;
  } else if (opt === 'light-soft') {
    ambientLight.intensity = 0.9;
    dirLight.intensity = 0.6;
    spotRed.intensity = 0.1;
    spotBlue.intensity = 0.1;
  } else if (opt === 'light-cyber') {
    ambientLight.intensity = 0.2;
    dirLight.intensity = 0.5;
    spotRed.color.set('#ff00cc'); // hot pink
    spotRed.intensity = 2.2;
    spotBlue.color.set('#00ffff'); // cyan
    spotBlue.intensity = 1.8;
  }
  requestRender();
}

export function setCameraPreset(opt) {
  if (!camera || !controls) return;
  if (opt === 'cam-default') {
    controls.autoRotate = true;
    camera.position.set(5, 3.2, 7);
    controls.target.set(0, 0.5, 0);
  } else if (opt === 'cam-side') {
    controls.autoRotate = false;
    camera.position.set(6.8, 1.0, 0);
    controls.target.set(0, 0.5, 0);
  } else if (opt === 'cam-overhead') {
    controls.autoRotate = false;
    camera.position.set(0.01, 7.2, 0.01);
    controls.target.set(0, 0.5, 0);
  }
  requestRender();
}

export function resetConfigurator() {
  setBodyColor(DEFAULT_COLOR);
  setWheelsOption('wheels-forged');
  setGlassTint('glass-clear');
  setLivery('livery-clean');
  setEnvironment('env-dark');
  setLighting('light-dramatic');
  setCameraPreset('cam-default');
  if (controls) {
    controls.reset();
  }
}
