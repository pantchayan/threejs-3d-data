import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import typeBasedArray from "./cleanData.js";

// const textureLoader = new THREE.TextureLoader();
// const fieldTexture = textureLoader.load("./normalMap.png");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(200, 500, 300);
scene.add(directionalLight);

//adding field

const fieldGeometry = new THREE.PlaneGeometry(1000, 1000);
const fieldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#222"),
  side: THREE.DoubleSide,
});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotation.x = -Math.PI / 2;
field.position.y = -0.01;
field.position.x = 10;
field.position.z = 5;
scene.add(field);

// scene.add(fieldFolder)

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
scene.add(camera);

camera.position.x = 20;
camera.position.y = 7;

camera.position.z = 10;

// DEBUG PANEL FOR FIELD

const gui = new dat.GUI({ width: 400 });
const cameraFolder = gui.addFolder("Camera");
const cameraPositionFolder = cameraFolder.addFolder("Camera position");
cameraPositionFolder.add(camera.position, "z", -100, 100);
cameraPositionFolder.add(camera.position, "y", -100, 100);
cameraPositionFolder.add(camera.position, "x", -100, 100);
const cameraRotationFolder = cameraFolder.addFolder("Camera rotation");
cameraRotationFolder.add(camera.rotation, "z", -6.28, 6.28);
cameraRotationFolder.add(camera.rotation, "y", -6.28, 6.28);
cameraRotationFolder.add(camera.rotation, "x", -6.28, 6.28);
cameraFolder.open();

//making shapes

let colors = [
  "#F9ED69",
  "#F08A5D",
  "#B83B5E",
  "#6A2C70",
  "#08D9D6",
  "#406882",
  "#FF8E00",
  "#D77FA1",
  "#BAABDA",
];

// making towers
let cube;
let makeCube = (typeBasedArray) => {
  let x = -9.5;
  let z = -9.5;

  for (let i = 0; i < typeBasedArray.length; i++) {
    let currentObject = typeBasedArray[i];
    for (let j = 0; j < currentObject.values.length; j++) {
      const Cgeometry = new THREE.BoxGeometry(
        0.5,
        currentObject.values[j].height,
        0.5
      );
      const Cmaterial = new THREE.MeshStandardMaterial({ color: colors[i] });
      cube = new THREE.Mesh(Cgeometry, Cmaterial);
      cube.position.x = x;

      cube.position.y = currentObject.values[j].height / 2;
      cube.position.z = z;

      scene.add(cube);
      x++;
    }
    x = -9.5;
    z++;
  }
};

makeCube(typeBasedArray);

//================================
let cameraTargetX = camera.position.x;
let cameraTargetZ = camera.position.z;
function handleKeyDown(e) {
  console.log(e.keyCode);
  e = e || window.event;

  if (e.keyCode == "38") {
    // up arrow
    cameraTargetZ -= 0.3;
  }
  if (e.keyCode == "40") {
    // down arrow
    cameraTargetZ += 0.3;
  }
  if (e.keyCode == "37") {
    // left arrow
    cameraTargetX -= 0.3;
  }
  if (e.keyCode == "39") {
    // right arrow
    cameraTargetX += 0.3;
  }
  if (e.keyCode == "27") {
    // esc
    mouseMovement();
    body.style.display = "none";
    canvas.style.display = "none";
  }
}

document.onkeydown = handleKeyDown;

document.addEventListener("keyup", (e) => {
  cameraTargetX = camera.position.x;
  cameraTargetZ = camera.position.z;
});

let mouseX = 0;
let mouseY = 0;

let mouseMovement = (e) => {
  mouseX = ((e.clientX - 0) / window.innerWidth) * 2 - 1;
  mouseY = ((e.clientY - 0) / window.innerHeight) * 2 - 1;
  // console.log(mouseX, mouseY);
};

document.addEventListener("mousemove", mouseMovement);

//==========================================

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const handleCameraFPV = (step) => {
  camera.rotation.x = -mouseY;
  camera.rotation.y = -mouseX;
  if (cameraTargetX > camera.position.x + step) {
    camera.position.x += step;
  } else if (cameraTargetX < camera.position.x - step) {
    camera.position.x -= step;
  }

  if (cameraTargetZ > camera.position.z + step) {
    camera.position.z += step;
  } else if (cameraTargetZ < camera.position.z - step) {
    camera.position.z -= step;
  }
};
let controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
let viewMode = "oc1";
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  if (viewMode === "fpv") {
    // controls = '';
    handleCameraFPV(0.1);
  } else if (viewMode === "oc1") {
    // controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
};

animate();

window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);

  renderer.render(scene, camera);
});

let fogColor = new THREE.Color("white");

scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 0.0025, 70);

document.getElementById("view").addEventListener("click", () => {
  viewMode = viewMode === "oc1" ? "fpv" : "oc1";

  camera.position.x = 20;
  camera.position.y = 2;

  camera.position.z = 10;
  if (viewMode === "fpv") {
    cameraTargetX = camera.position.x;
    cameraTargetZ = camera.position.z;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    // camera.lookAt(0, 0, 0);
  } else {
    camera.position.x = 20;
    camera.position.y = 7;

    camera.position.z = 10;
  }
});
