import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module'
import { GUI } from 'dat.gui'

const planeData = {
	width: 10,
	height: 5,
	resX: 512,
	resY: 256,
}

const hdrParams = {
	exposure: 1.0
};

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x222222);
scene.add(new THREE.AxesHelper(1))

const light = new THREE.DirectionalLight(0xffffff, 1)
const lightAmb = new THREE.AmbientLight(0xffffff, 0.15)
light.position.set(5, 5, -5)
// light.castShadow = false;
light.shadow.bias = -0.0001;
light.shadow.normalBias = -0.01;
light.shadow.mapSize.width = 1024; // default
light.shadow.mapSize.height = 1024; // default

scene.add(light)
scene.add(lightAmb)

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.01,
	100
)
camera.position.z = 3
camera.position.y = 5

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.localClippingEnabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = hdrParams.exposure;

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
orbit.target.set(0, 1, 0);
//controls.addEventListener('change', render)

// const planeGeometry = new THREE.SphereGeometry(1, planeData.widthSegments, planeData.heightSegments)
const planeGeometry = new THREE.PlaneGeometry(planeData.width, planeData.height, planeData.resX, planeData.resY)

const materialSDR = new THREE.MeshStandardMaterial()
const materialHDR = new THREE.MeshLambertMaterial()

// const texture = new THREE.TextureLoader().load('img/earth.jpg')
// const displacementMap = new THREE.TextureLoader().load('img/earth_height.jpg')
const texture = new THREE.TextureLoader().load('img/ph.jpg')
const displacementMap = new THREE.TextureLoader().load('img/ph.jpg')
materialSDR.map = texture
materialSDR.roughness = 0.4
materialSDR.displacementMap = displacementMap
materialSDR.displacementScale = 1
materialSDR.displacementBias = -0
materialSDR.flatShading = true
// material.wireframe = true
materialSDR.side = 2
materialSDR.polygonOffset = true;
materialSDR.polygonOffsetFactor = -0.5; //0.96 was purple


materialHDR.map = texture
// materialHDR.roughness = 0.5 
materialHDR.displacementMap = displacementMap
materialHDR.displacementScale = 1
materialHDR.displacementBias = -0
// materialHDR.flatShading = true
materialHDR.wireframe = true
materialHDR.side = 2
materialHDR.transparent = true;
materialHDR.opacity = 0.1;

const clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
materialHDR.clippingPlanes = [clip];
materialHDR.clipIntersection = false;
materialHDR.toneMapped = false;



const planeSDR = new THREE.Mesh(planeGeometry, materialSDR).rotateX(-Math.PI * 0.5)
const planeHDR = new THREE.Mesh(planeGeometry, materialHDR).rotateX(-Math.PI * 0.5)
const hdrParent = new THREE.Object3D();
hdrParent.position.set(0, 1, 0);
scene.add(planeSDR)
scene.add(planeHDR)
scene.add(hdrParent)
hdrParent.attach(planeHDR);




function updateHDR(img) {
	new RGBELoader()
		.load(img, function (texture, textureData) {
			planeSDR.material.map = texture;
			planeSDR.material.displacementMap = texture;
			planeSDR.castShadow = true;
			planeSDR.receiveShadow = true;
			planeHDR.material.map = texture;
			planeHDR.material.displacementMap = texture;
			planeHDR.castShadow = true;
			// planeHDR.receiveShadow = true;
			console.log(texture);
			console.log(textureData);
		});
}


// document.addEventListener("dragstart", function (event) {
// 	event.dataTransfer.setData("Text", event.target.id);
// 	// document.getElementById("demo").innerHTML = "Started to drag the p element.";
// 	console.log('dragstart');
// });
document.addEventListener("dragover", (event) => {
	event.preventDefault();
	console.log('dragover');
});
document.addEventListener("drop", (event) => {
	console.log('drop');
	event.preventDefault();
	// const data = event.dataTransfer.getData("Text");
	const files = event.dataTransfer.files;
	if (files[0]) {
		console.log(files[0].name);

		var file = files[0];
		var reader = new FileReader();
		reader.onload = (event) => {
			// holder.style.background =
			// 	'url(' + event.target.result + ') no-repeat center';

			// var image = document.createElement('img');
			// image.src = event.target.result;
			// var texture = new THREE.Texture(image);
			// texture.needsUpdate = true;
			updateHDR(event.target.result);
			// scene.getObjectByName('cube').material.map = texture;
		};
		reader.readAsDataURL(file);
		// return false;

	}
	// event.target.appendChild(document.getElementById(data));
	// document.getElementById("demo").innerHTML = "The p element was dropped";
});
// function uploadFile(file) {
// 	let url = 'YOUR URL HERE'
// 	let formData = new FormData()

// 	formData.append('file', file)

// 	fetch(url, {
// 		method: 'POST',
// 		body: formData
// 	})
// 		.then(() => { /* Done. Inform the user */ })
// 		.catch(() => { /* Error. Inform the user */ })
// }

window.addEventListener('keydown', (e) => {
	if (e.code === 'F9') {
		console.log(scene);
	}
})
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const optionsSDR = {
	side: {
		FrontSide: THREE.FrontSide,
		BackSide: THREE.BackSide,
		DoubleSide: THREE.DoubleSide,
	},
}
const dataSDR = {
	dispScale: 1,
	dispBias: 0,
	color: materialSDR.color.getHex(),
	emissive: materialSDR.emissive.getHex(),
	roughness: materialSDR.roughness
}
const optionsHDR = {
	side: {
		FrontSide: THREE.FrontSide,
		BackSide: THREE.BackSide,
		DoubleSide: THREE.DoubleSide,
	},
}
const dataHDR = {
	color: materialHDR.color.getHex(),
	emissive: materialHDR.emissive.getHex(),
	dispScale: 1,
	hdrScaleUp: 1,
	hdrScaleDown: 1,
	dispBias: 0,
	clipConstant: 1,
}

const gui = new GUI()
const guiMain = gui.addFolder('Main')
guiMain.add(hdrParams, 'exposure', 0, 3, 0.01)
	.onChange((v) => { renderer.toneMappingExposure = v });
guiMain.add(planeData, 'resX', 1, 2048).name('Res X')
	.onChange(regeneratePlaneGeometry)
guiMain.add(planeData, 'resY', 1, 1024).name('Res Y')
	.onChange(regeneratePlaneGeometry)
guiMain.open();


const guiHDR = gui.addFolder('HDR')
guiHDR.add(materialHDR, 'visible')
guiHDR.add(dataHDR, 'hdrScaleUp', 0, 100, 0.0001).onChange((v) => { hdrParent.scale.setY(dataHDR.hdrScaleUp * 1 / dataHDR.hdrScaleDown); })
guiHDR.add(dataHDR, 'hdrScaleDown', 0.0001, 100, 0.0001).onChange((v) => { hdrParent.scale.setY(dataHDR.hdrScaleUp * 1 / dataHDR.hdrScaleDown); })
guiHDR.addColor(dataHDR, 'color').onChange(() => {
	materialHDR.color.setHex(Number(dataHDR.color.toString().replace('#', '0x')))
})
guiHDR.addColor(dataHDR, 'emissive').onChange(() => {
	materialHDR.emissive.setHex(
		Number(dataHDR.emissive.toString().replace('#', '0x'))
	)
})
guiHDR.add(materialHDR, 'opacity', 0, 1, 0.01)
// guiHdrFolder.add(materialHDR, 'roughness', 0, 1)
guiHDR.open()

const guiHDRmore = guiHDR.addFolder('More')
guiHDRmore.add(dataHDR, 'dispScale', 0, 1, 0.0001).onChange((v) => { materialHDR.displacementScale = dataHDR.dispScale })
guiHDRmore.add(dataHDR, 'dispBias', -1, 1, 0.001).onChange((v) => { materialHDR.displacementBias = dataHDR.dispBias })
guiHDRmore.add(dataHDR, 'clipConstant', 0, 2, 0.01).name('Clipping').onChange((v) => { clip.constant = -dataHDR.clipConstant })
guiHDRmore.add(materialHDR, 'transparent')
	.onChange(() => materialHDR.needsUpdate = true)
	.onChange(() => updateMaterialHDR())
guiHDRmore.add(materialHDR, 'depthTest')
guiHDRmore.add(materialHDR, 'depthWrite')
guiHDRmore.add(materialHDR, 'side', optionsHDR.side)
// guiHDR.add(materialHDR, 'alphaTest', 0, 1, 0.01)
// .onChange(() => updateMaterialHDR())
guiHDRmore.add(materialHDR, 'wireframe')
guiHDRmore.add(materialHDR, 'flatShading')
	.onChange(() => updateMaterialHDR())
guiHDRmore.add(materialHDR, 'toneMapped')
guiHDRmore.add(light, 'castShadow', light.castShadow);



const guiSDR = gui.addFolder('SDR')
guiSDR.add(materialSDR, 'visible')
guiSDR.add(dataSDR, 'dispScale', 0, 1, 0.0001).onChange((v) => { materialSDR.displacementScale = dataSDR.dispScale; materialSDR.displacementBias = 1 - dataSDR.dispScale + dataSDR.dispBias; })
guiSDR.add(materialSDR, 'roughness', 0, 1)
guiSDR.open()

const guiSDRmore = guiSDR.addFolder('More')
guiSDRmore.add(dataSDR, 'dispBias', -1, 1, 0.001).onChange((v) => { materialSDR.displacementBias = 1 - dataSDR.dispScale + dataSDR.dispBias; })
guiSDRmore.add(materialSDR, 'transparent')
	.onChange(() => materialSDR.needsUpdate = true)
guiSDRmore.add(materialSDR, 'opacity', 0, 1, 0.01)
guiSDRmore.add(materialSDR, 'depthTest')
guiSDRmore.add(materialSDR, 'depthWrite')
// guiSDR.add(materialSDR, 'alphaTest', 0, 1, 0.01)
// .onChange(() => updateMaterialSDR())
guiSDRmore.add(materialSDR, 'side', optionsSDR.side)
	.onChange(() => updateMaterialSDR())
guiSDRmore.addColor(dataSDR, 'color').onChange(() => {
	materialSDR.color.setHex(Number(dataSDR.color.toString().replace('#', '0x')))
})
guiSDRmore.addColor(dataSDR, 'emissive').onChange(() => {
	materialSDR.emissive.setHex(
		Number(dataSDR.emissive.toString().replace('#', '0x'))
	)
})
guiSDRmore.add(materialSDR, 'wireframe')
guiSDRmore.add(materialSDR, 'flatShading')
	.onChange(() => updateMaterialSDR())


function updateMaterialSDR() {
	materialSDR.side = Number(materialSDR.side)
	materialSDR.needsUpdate = true
}
function updateMaterialHDR() {
	materialHDR.side = Number(materialHDR.side)
	materialHDR.needsUpdate = true
}

// const planePropertiesFolder = gui.addFolder('PlaneGeometry')
// //planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
// //planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)

// planePropertiesFolder.open()


function regeneratePlaneGeometry() {
	const newGeometry = new THREE.PlaneGeometry(
		planeData.width,
		planeData.height,
		planeData.resX,
		planeData.resY
	)
	planeSDR.geometry.dispose()
	planeSDR.geometry = newGeometry
	planeHDR.geometry.dispose()
	planeHDR.geometry = newGeometry
}

function animate() {
	requestAnimationFrame(animate)

	render()

	stats.update()
}

function render() {
	renderer.render(scene, camera)
}

planeSDR.material.onBeforeCompile = (shader) => {
	console.log(shader);
	// shader.fragmentShader = shader.fragmentShader.replace(
	// 	'vec4 diffuseColor = vec4( diffuse, opacity );',
	// 	'vec4 diffuseColor = vec4( clamp(diffuse, vec3(0,0,0), vec3(1,1,1)), opacity );'
	// );

	// shader.fragmentShader = shader.fragmentShader.replace(
	// 	'#include <output_fragment>',
	// 	[
	// 		'#include <output_fragment>',
	// 		'outgoingLight = clamp(outgoingLight, vec3(0,0,0), vec3(1,0,1));'
	// 	].join('\n')
	// );

	shader.vertexShader = shader.vertexShader.replace(
		'#include <displacementmap_vertex>',
		[
			'	transformed += normalize( objectNormal ) * ( clamp(texture2D( displacementMap, uv ).x, 0.0, 1.0) * displacementScale + displacementBias );			'
		].join('\n')
	);
	console.log(shader);
};

planeHDR.material.onBeforeCompile = (shader) => {
	console.log(shader);
	// shader.fragmentShader = shader.fragmentShader.replace(
	// 	'#include <output_fragment>',
	// 	[
	// 		'#include <output_fragment>',

	// 		'float x = 0.9;',
	// 		'if(gl_FragColor.r >= x || gl_FragColor.g >= x || gl_FragColor.b >= x){',
	// 		'gl_FragColor = vec4(gl_FragColor.rgb, 1.0); }',
	// 		'else{ gl_FragColor = vec4(gl_FragColor.rgb, 0.0); }',

	// 		// 'float y = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0 ;',
	// 		// 'gl_FragColor = vec4(gl_FragColor.rgb, y); '
	// 	].join('\n')
	// );

	// // OK
	// shader.fragmentShader = shader.fragmentShader.replace(
	// 	'#include <map_fragment>',
	// 	[
	// 		`
	// 			#include <map_fragment>
	// 			// #ifdef USE_MAP

	// 			// 	vec4 texelColor = texture2D( map, vUv );

	// 			// 	texelColor = mapTexelToLinear( texelColor );
	// 			// 	diffuseColor *= texelColor;

	// 			// 	#endif

	// 			// diffuseColor = clamp(diffuseColor, 0.0, 1.0);

	// 			float x = 1.0;
	// 			if(diffuseColor.r >= x || diffuseColor.g >= x || diffuseColor.b >= x){
	// 				diffuseColor = vec4(diffuseColor.rgb, diffuseColor.a); }
	// 			else{ diffuseColor = vec4(diffuseColor.rgb, 0.0); }

	// 			// float y = (diffuseColor.r + diffuseColor.g + diffuseColor.b) / 3.0 ;
	// 			// diffuseColor.rgb = vec3(0,1,0);
	// 			// diffuseColor.a = y;
	// 		`
	// 	].join('\n')
	// );
};

console.log(scene);
console.log(planeSDR.material);
console.log(planeHDR.material);

updateHDR('img/ramps.hdr');

animate()