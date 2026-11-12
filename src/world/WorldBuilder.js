import * as THREE from 'three';
import { createRoadsideCorner } from './RoadsideCorner.js';

const ROAD_LENGTH = 850;
const ROAD_CENTER_Z = 80 - ROAD_LENGTH * .5;

export function buildWorld(scene, world) {
  const mat = (color, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
  const roadMat = mat('#4a4b49'), sidewalkMat = mat('#80796a'), grassMat = mat('#436b46');
  const road = new THREE.Mesh(new THREE.PlaneGeometry(22, ROAD_LENGTH), roadMat); road.rotation.x = -Math.PI / 2; road.position.set(0, -0.12, ROAD_CENTER_Z); road.receiveShadow = true; scene.add(road);
  const floorBody = world.createRigidBody(window.RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.2, ROAD_CENTER_Z));
  world.createCollider(window.RAPIER.ColliderDesc.cuboid(11, 0.2, ROAD_LENGTH * .5).setFriction(1), floorBody);
  const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(4, ROAD_LENGTH), sidewalkMat); sidewalk.rotation.x = -Math.PI / 2; sidewalk.position.set(13, -0.03, ROAD_CENTER_Z); scene.add(sidewalk);
  const sidewalk2 = sidewalk.clone(); sidewalk2.position.x = -13; scene.add(sidewalk2);
  const lineMat = mat('#d8cba0', 0.7); const dashGeom = new THREE.BoxGeometry(0.16, 0.025, 3.2);
  for (let z = 45; z > -610; z -= 8) { const dash = new THREE.Mesh(dashGeom, lineMat); dash.position.set(0, 0.015, z); scene.add(dash); }
  const buildingColors = ['#b77c58','#d5bd85','#889c84','#c27d73','#b6a78f','#8395a1'];
  const blockGeom = new THREE.BoxGeometry(1,1,1);
  const propInstances = buildingColors.map(color => new THREE.InstancedMesh(blockGeom, mat(color), 80));
  const propCounts = new Array(propInstances.length).fill(0);
  const dummy = new THREE.Object3D();
  for (let side of [-1,1]) for (let i = 0; i < 60; i++) {
    const z = 35 - i * 10.7; const width = 5 + (i % 3) * 1.1; const height = 7 + (i % 4) * 1.6;
    dummy.position.set(side * (15 + width * .5), height * .5 - .1, z); dummy.scale.set(width, height, 8 + (i % 2)); dummy.updateMatrix(); const group = i % propInstances.length; propInstances[group].setMatrixAt(propCounts[group]++, dummy.matrix);
    const body = world.createRigidBody(window.RAPIER.RigidBodyDesc.fixed().setTranslation(side * (15 + width * .5), height * .5 - .1, z));
    world.createCollider(window.RAPIER.ColliderDesc.cuboid(width * .5, height * .5, 4.3), body);
  }
  for (let i = 0; i < propInstances.length; i++) { const mesh = propInstances[i]; mesh.count = propCounts[i]; mesh.instanceMatrix.needsUpdate = true; mesh.castShadow = true; scene.add(mesh); }
  // Batch repeating trees and poles; one draw call per material group.
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.17,.23,3,7), mat('#73543a'), 48);
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6,1), mat('#487649'), 48);
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.11,6,6), mat('#65625c'), 48);
  for (let i = 0; i < 44; i++) {
    const z = 28 - i * 14; const side = i % 2 ? -1 : 1; dummy.position.set(side * 12.4, 1.4, z); dummy.scale.set(1,1,1); dummy.updateMatrix(); trunk.setMatrixAt(i,dummy.matrix);
    dummy.position.set(side * 12.4, 4.3, z); dummy.scale.set(1,1.05,1); dummy.updateMatrix(); crown.setMatrixAt(i,dummy.matrix);
    dummy.position.set(-side * 11.7, 3, z - 6); dummy.scale.set(1,1,1); dummy.updateMatrix(); pole.setMatrixAt(i,dummy.matrix);
  }
  trunk.count = crown.count = pole.count = 44; trunk.instanceMatrix.needsUpdate = crown.instanceMatrix.needsUpdate = pole.instanceMatrix.needsUpdate = true;
  scene.add(trunk,crown,pole);
  const actors = [];
  const trafficMat = mat('#d2a93d',.55); const trafficGeom = new THREE.BoxGeometry(1.7,.9,3.3);
  for (let i=0;i<22;i++) { const mesh = new THREE.Mesh(trafficGeom,trafficMat); const x = i%2 ? -4.2 : 4.2, y = .55, z = -20-i*26; mesh.position.set(x,y,z); mesh.castShadow=true; scene.add(mesh); const body=world.createRigidBody(window.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,y,z)); const collider=world.createCollider(window.RAPIER.ColliderDesc.cuboid(.9,.5,1.7),body); actors.push({id:`traffic-${i}`,x,y,z,radius:1,mesh,body,collider,type:'traffic',baseZ:z}); }
  // Small deterministic herd: one of ten is tagged as the rare Netaji Bull (~10%).
  const cowMaterial=mat('#d1c2a0');const cowGeometry=new THREE.CapsuleGeometry(.47,.8,3,7);
  for(let i=0;i<10;i++){
    const x=i%2===0?-2.2:2.2,y=.9,z=-72-i*41;const cow=new THREE.Group();const cowBody=new THREE.Mesh(cowGeometry,cowMaterial);cowBody.rotation.z=Math.PI/2;cow.add(cowBody);cow.position.set(x,y,z);scene.add(cow);
    const netaji=i===4;const body=world.createRigidBody(window.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,y,z));const collider=world.createCollider(window.RAPIER.ColliderDesc.ball(1),body);
    actors.push({id:`cow-union-${i}`,x,y,z,radius:1.2,mesh:cow,body,collider,type:'cow',netaji,scatterUntil:0,chargeUntil:0});
  }
  const roadsideCorner = createRoadsideCorner(scene);
  return { actors, road, grassMat, roadsideCorner };
}
