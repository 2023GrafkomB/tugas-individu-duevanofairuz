import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import grassside from '../img/grassside.jpg';
import grasstop from '../img/grasstop.jpg';
import grassbot from '../img/grassbot.jpg';
import galaxy2 from '../img/galaxy2.png';

const mp5Url = new URL('../assets/hk_mp5_smg.glb', import.meta.url);
const talonUrl = new URL('../assets/talon_william_cobb.glb', import.meta.url);
const sabreUrl = new URL('../assets/sabre.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
// scene.fog = new THREE.Fog(0x333333, 0, 200);    //fog cara1
scene.fog = new THREE.FogExp2(0x333333, 0.01);     //fog cara2

const textureLoader = new THREE.TextureLoader();      
const cubeTextureLoader = new THREE.CubeTextureLoader();

const assetLoader = new GLTFLoader();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 
    1000
);
camera.position.set(-30, 50, 0);

const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//-------------------------bikin light start
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.shadow.camera.bottom = -10;
// directionalLight.shadow.camera.top = 20;
// directionalLight.castShadow= true;
// scene.add(directionalLight);

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
// scene.add(directionalLightHelper);

// const directionalLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightShadowHelper);

//spotlight start
const spotLight = new THREE.SpotLight(0xFFFFFF, 9000);
scene.add(spotLight);
spotLight.position.set(-80, 80, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);
//spotlight end
//-------------------------bikin light end




//-------------------------------bikin alas dan grid start
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFCF3CF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow=true;
// plane.receiveShadow = true;
const gridHelper = new THREE.GridHelper(100);
scene.add(gridHelper);
//-----------------------------bikin alas dan grid end



//--------------------------------cube bg texture start
const cubeBGTexture = cubeTextureLoader.load([
    galaxy2,
    galaxy2,
    galaxy2,
    galaxy2,
    galaxy2,
    galaxy2
]);
cubeBGTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = cubeBGTexture;
//--------------------------------cube bg texture end



//---------------------------------bikin matahari start
const torusGeometry = new THREE.TorusGeometry( 10, 3, 16, 100 ); 
const torusMaterial = new THREE.MeshNormalMaterial( { 
    // color: 0xF39C12 
} ); 
const torus = new THREE.Mesh( torusGeometry, torusMaterial ); 
torus.position.set(-80, 80, 0);
torus.lookAt(new THREE.Vector3(1, 0, 0));
scene.add( torus );
//---------------------------------bikin matahari end











// -------------------------------bikin box1 start
const box1Geometry = new THREE.BoxGeometry(3, 3, 3);
const box1Material = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: false
});
const box1 = new THREE.Mesh(box1Geometry, box1Material);
scene.add(box1);
box1.position.set(0, 5, 0);
box1.castShadow = true;
//---------------------------------bikin box1 end

//---------------------------------bikin sphere start
const sphereGeometry = new THREE.SphereGeometry(2, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(8, 10, 0);
scene.add(sphere);
sphere.castShadow = true;
//---------------------------------bikin spehere end



//--------------------------------bikin mangkok
const lathePoints = [];
for ( let i = 0; i < 10; i ++ ) {
	lathePoints.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 3 + 5, ( i - 5 ) * 1 ) );
}
const latheGeometry = new THREE.LatheGeometry( lathePoints, 100 );
const latheMaterial = new THREE.MeshBasicMaterial({
     color: 0xffff00,
     side: THREE.DoubleSide,
     wireframe: false
});
const lathe = new THREE.Mesh( latheGeometry, latheMaterial );
lathe.position.set(20, 20, 20);
lathe.castShadow = true;
scene.add( lathe );
//--------------------------------bikin mangkok



//----------------------------------bikin dirt
//bikin box2 start
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2SideTexture = textureLoader.load(grassside);
const box2TopTexture = textureLoader.load(grasstop);
const box2BotTexture = textureLoader.load(grassbot);
box2SideTexture.colorSpace = THREE.SRGBColorSpace;
box2TopTexture.colorSpace = THREE.SRGBColorSpace;
box2BotTexture.colorSpace = THREE.SRGBColorSpace;
const box2MultiMaterial = [
    new THREE.MeshStandardMaterial({map: box2SideTexture}),
    new THREE.MeshStandardMaterial({map: box2SideTexture}),
    new THREE.MeshStandardMaterial({map: box2TopTexture}),
    new THREE.MeshStandardMaterial({map: box2BotTexture}),
    // new THREE.MeshStandardMaterial({map: textureLoader.load(grasstop)}),
    // new THREE.MeshStandardMaterial({map: textureLoader.load(grassbot)}),
    new THREE.MeshStandardMaterial({map: box2SideTexture}),
    new THREE.MeshStandardMaterial({map: box2SideTexture}),
];
// box2MultiMaterial.color = THREE.SRGBColorSpace;
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);
box2.castShadow = true;
//bikin box2 end
//----------------------------------bikin dirt



//----------------------------------load mp5 start
assetLoader.load(mp5Url.href, function(gltf){
    const mp5 = gltf.scene;
    scene.add(mp5);

    const scaleFactor = 10; // You can adjust this value as needed
    mp5.scale.set(scaleFactor, scaleFactor, scaleFactor);

    mp5.position.set(0, 2, 10);
    mp5.castShadow = true;

    mp5.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.shadowSide = THREE.DoubleSide;
            child.material.shadowMap.autoUpdate = true;
        }
    });

}, undefined, function(error){
    console.error(error);
});
//-----------------------------------load mp5 end



//-------------------------------------load talon start
assetLoader.load(talonUrl.href, function(gltf){
    const talon = gltf.scene;
    scene.add(talon);

    const scaleFactor = 500; // You can adjust this value as needed
    talon.scale.set(scaleFactor, scaleFactor, scaleFactor);

    talon.position.set(0, 0, -20);
    talon.lookAt(new THREE.Vector3(-20, 0, 0));

    talon.castShadow = true;
    talon.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.shadowSide = THREE.DoubleSide;
            child.material.shadowMap.autoUpdate = true;
        }
    });


}, undefined, function(error){
    console.error(error);
});
//-------------------------------------load talon end


let mixer;
const animationOptions = {
    animationName: 'Stalker', // Default animation
    playAnimation: false, // Initially stopped
  };
//--------------------------------------load sabre start
assetLoader.load(sabreUrl.href, function(gltf){
    const sabre = gltf.scene;
    scene.add(sabre);

    mixer = new THREE.AnimationMixer(sabre);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'Attack'); //ubah manual
    const action = mixer.clipAction(clip);
    action.play();

    const scaleFactor = 5; // You can adjust this value as needed
    sabre.scale.set(scaleFactor, scaleFactor, scaleFactor);
    sabre.position.set(-10, 0, -5);
    sabre.lookAt(new THREE.Vector3(20, 0, 0));

    sabre.castShadow = true;
    sabre.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.shadowSide = THREE.DoubleSide;
            child.material.shadowMap.autoUpdate = true;
        }
    });


}, undefined, function(error){
    console.error(error);
});
//----------------------------------------load sabre end

//animation for sabre
function playAnimation() {
    if (mixer) {
      // Stop any previously playing animation
      mixer.stopAllAction();
      
      // Find and play the selected animation
      const clips = gltf.animations;
      const clip = THREE.AnimationClip.findByName(clips, animationOptions.animationName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
    }
  }

  function toggleAnimation() {
    if (mixer) {
      if (animationOptions.playAnimation) {
        // Play the selected animation
        const clips = gltf.animations;
        const clip = THREE.AnimationClip.findByName(clips, animationOptions.animationName);
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();
        }
      } else {
        // Stop the animation
        mixer.stopAllAction();
      }
    }
  }




//---------------------------------dat gui start
const gui = new dat.GUI();  //instansiasi dat.gui
const options = {
    sphereColor: '#FFFFFF',
    wireframe: false,
    speed: 0.01,
    spotLightAngle: 0.2,
    spotLightPenumbra: 0,
    spotLightIntensity: 9000,
    sabreWalk: false
    // spotLightPositionX: -80
};
gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});
gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e;
});
gui.add(options, 'speed', 0, 0.1);
gui.add(options, 'spotLightAngle', 0, 1);
gui.add(options, 'spotLightPenumbra', 0, 1);
gui.add(options, 'spotLightIntensity', 0, 50000);

// Add a dropdown to select the animation
const animationFolder = gui.addFolder('Animations');
animationFolder.add(animationOptions, 'animationName', ['Stalker', 'Bite', 'Attack', 'Run2']).onChange(toggleAnimation);
animationFolder.add(animationOptions, 'playAnimation').name('Play Animation');
//---------------------------------dat gui end


let step = 0;
const clock = new THREE.Clock();
function animate(){ //fungsi untuk mengupdate dan menganimasikan semua scene
    box1.rotation.x += 0.01;
    box1.rotation.y += 0.01;

    step +=options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    spotLight.angle = options.spotLightAngle;
    spotLight.penumbra = options.spotLightPenumbra;
    spotLight.intensity = options.spotLightIntensity;
    sLightHelper.update();

    if(mixer)
        mixer.update(clock.getDelta()); 

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate); //agar renderer dijalankan setiap satuan detik

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidht, window.innerHeight);
});

