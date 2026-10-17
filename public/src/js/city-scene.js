/* Pontos de luz Three.js para dar profundidade. A fotografia continua sendo o cenário principal e funciona sem WebGL. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';
const canvas=document.getElementById('city-canvas');
if(canvas&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 try{
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.4));renderer.setSize(innerWidth,innerHeight,false);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);camera.position.z=18;
  const count=110,positions=new Float32Array(count*3),sizes=new Float32Array(count);let seed=41;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*28;positions[i*3+1]=(random()-.5)*14;positions[i*3+2]=(random()-.5)*5;sizes[i]=.025+random()*.045;}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xff72c8,size:.07,transparent:true,opacity:.62,sizeAttenuation:true}));scene.add(points);
  let px=0,py=0;addEventListener('pointermove',e=>{px=(e.clientX/innerWidth-.5)*.12;py=(e.clientY/innerHeight-.5)*.08},{passive:true});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.4));});
  const clock=new THREE.Clock();function render(){const t=clock.getElapsedTime();points.rotation.y=px+Math.sin(t*.12)*.025;points.rotation.x=py+Math.cos(t*.1)*.015;renderer.render(scene,camera);requestAnimationFrame(render);}render();
 }catch(error){canvas.hidden=true;console.info('Three.js indisponível; o fundo estático segue ativo.',error);}
}
