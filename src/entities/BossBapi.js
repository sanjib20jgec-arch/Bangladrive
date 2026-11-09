import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class BossBapi {
  constructor(scene,startZ=-145){
    this.scene=scene;this.group=new THREE.Group();this.group.position.set(0,0,startZ);this.health=100;this.phase=1;this.clock=0;this.telegraph=0;this.attack=0;this.dead=false;this.x=0;this.z=startZ;this.weakPoint=null;
    const yellow=new THREE.MeshStandardMaterial({color:'#d6a326',roughness:.52,metalness:.28});const dark=new THREE.MeshStandardMaterial({color:'#333537',roughness:.82});const glass=new THREE.MeshStandardMaterial({color:'#638296',metalness:.25,roughness:.2});
    const box=(w,h,d,m,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;this.group.add(mesh);return mesh;};
    box(2.7,1.15,3.8,yellow,0,1.05,0);box(2.05,1.2,1.7,glass,0,2.05,-.48);box(3.2,.55,.55,yellow,0,.72,-2.05);box(3.5,.7,.7,dark,0,.38,-2.48);
    const wheelGeo=new THREE.CylinderGeometry(.48,.48,.34,10);for(const x of [-1.32,1.32])for(const z of [-1.25,1.25]){const wheel=new THREE.Mesh(wheelGeo,dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.5,z);wheel.castShadow=true;this.group.add(wheel);}
    this.weakPoint=new THREE.Mesh(new THREE.BoxGeometry(1.25,.72,.2),new THREE.MeshStandardMaterial({color:'#ff552c',emissive:'#e42c15',emissiveIntensity:0,roughness:.38}));this.weakPoint.position.set(0,1.25,2.03);this.group.add(this.weakPoint);
    this.ring=new THREE.Mesh(new THREE.RingGeometry(1.8,2.35,32),new THREE.MeshBasicMaterial({color:'#ff4c26',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.04;this.group.add(this.ring);
    this.smoke=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:'#53504b',transparent:true,opacity:0}));this.smoke.position.set(0,2.7,1.8);this.group.add(this.smoke);scene.add(this.group);
    this.hazardGeo=new THREE.CylinderGeometry(.18,.18,2.4,8);this.hazardMat=new THREE.MeshStandardMaterial({color:'#6f5943',metalness:.58,roughness:.44});this.pipe=new THREE.Mesh(this.hazardGeo,this.hazardMat);this.pipe.rotation.z=Math.PI/2;this.pipe.visible=false;this.scene.add(this.pipe);this.pipeActive=false;this.pipeHit=false;this.pipeCooldown=2.5;
  }
  setPhase(phase){if(phase===this.phase)return;this.phase=phase;EventBus.emit('bossPhase',{phase,label:['','BAPI CHARGE!','DIESEL DHUM!','RADIATOR EXPOSED!'][phase]});}
  update(dt,player){
    if(this.dead)return;this.clock+=dt;this.attack=Math.max(0,this.attack-dt);this.telegraph=Math.max(0,this.telegraph-dt);
    const targetPhase=this.health>65?1:this.health>30?2:3;this.setPhase(targetPhase);
    const dx=player.x-this.x,dz=player.z-this.z,distance=Math.hypot(dx,dz);
    if(distance<5&&player.drifting&&(this.phase!==3||player.z>this.z+1.2)){this.health=Math.max(0,this.health-dt*(this.phase===3?28:7));if(Math.floor(this.clock*5)!==Math.floor((this.clock-dt)*5)){EventBus.emit('styleAction',{points:125});EventBus.emit('bossHit',{health:this.health,phase:this.phase});}}
    if(this.phase===1){this.group.position.x=Math.sin(this.clock*1.1)*2.3;this.group.position.z=this.z+Math.sin(this.clock*.65)*2;this.ring.material.opacity=0;this.smoke.material.opacity=0;this.pipeCooldown-=dt;if(this.pipeCooldown<=0&&!this.pipeActive){this.pipeActive=true;this.pipeHit=false;this.pipeCooldown=4.8;this.pipe.position.set(this.group.position.x,.34,this.group.position.z+2.8);this.pipe.visible=true;}if(this.pipeActive){this.pipe.position.z+=7.5*dt;this.pipe.rotation.x+=5*dt;if(!this.pipeHit&&Math.abs(player.x-this.pipe.position.x)<1.7&&Math.abs(player.z-this.pipe.position.z)<2){this.pipeHit=true;EventBus.emit('bossHazardNear',{kind:'rolling-pipe'});}if(this.pipe.position.z>player.z+8){this.pipeActive=false;this.pipe.visible=false;}}}else{this.pipeActive=false;this.pipe.visible=false;}
    if(this.phase===2){this.group.position.x=Math.sin(this.clock*.6)*3;this.group.position.z=this.z+Math.sin(this.clock*.4);this.smoke.material.opacity=.48;const scale=.8+(this.clock%1.3)*1.7;this.ring.scale.setScalar(scale);this.ring.material.opacity=.28+Math.sin(this.clock*6)*.16;if(this.telegraph===0&&this.attack===0){this.telegraph=1.2;this.attack=3.4;EventBus.emit('bossTelegraph',{kind:'shockwave',seconds:1.2});}}
    if(this.phase===3){this.group.position.x=Math.sin(this.clock*1.7)*1.5;this.group.position.z=this.z;this.weakPoint.material.emissiveIntensity=1.1+Math.sin(this.clock*8)*.6;this.smoke.material.opacity=.7;this.ring.material.opacity=0;}
    this.x=this.group.position.x;this.z=this.group.position.z;
    if(this.health<=0){this.dead=true;EventBus.emit('bossDefeated',{reward:500});this.group.visible=false;}
    return distance;
  }
  dispose(){this.scene.remove(this.group);this.scene.remove(this.pipe);this.group.traverse(node=>{if(node.isMesh){node.geometry.dispose();if(Array.isArray(node.material))node.material.forEach(m=>m.dispose());else node.material.dispose();}});this.hazardGeo.dispose();this.hazardMat.dispose();}
}
