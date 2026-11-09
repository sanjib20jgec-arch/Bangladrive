import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

const TYPES = [
  { name:'crate', geometry:()=>new THREE.BoxGeometry(.72,.62,.72), color:'#bd7a39', size:[.72,.62,.72] },
  { name:'stool', geometry:()=>new THREE.CylinderGeometry(.31,.35,.38,8), color:'#d64d37', size:[.7,.38,.7] },
  { name:'pot', geometry:()=>new THREE.CylinderGeometry(.26,.38,.52,9), color:'#b65d3b', size:[.76,.52,.76] },
  { name:'bamboo', geometry:()=>new THREE.CylinderGeometry(.06,.08,1.35,6), color:'#b5a05a', size:[.1,1.35,.1] },
];

export class DestructiblePropPool {
  constructor(scene, worldCount=64) {
    this.scene=scene; this.items=[]; this.meshes=[]; this.dummy=new THREE.Object3D();
    this.eventPayload={points:75,kind:'street-prop'};
    for(let typeIndex=0;typeIndex<TYPES.length;typeIndex++){
      const type=TYPES[typeIndex]; const material=new THREE.MeshStandardMaterial({color:type.color,roughness:.88});
      const mesh=new THREE.InstancedMesh(type.geometry(),material,worldCount); mesh.count=Math.ceil(worldCount/TYPES.length); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); this.meshes.push(mesh);
    }
    for(let i=0;i<worldCount;i++){
      const side=i%2===0?1:-1; const x=side*(8.5+(i%4)*.5); const z=20-Math.floor(i/2)*13.5;
      this.items.push({x,z,baseX:x,baseZ:z,y:.32,vx:0,vy:0,vz:0,spin:0,rotation:0,life:0,type:i%TYPES.length,active:false,scale:1});
    }
    this.syncAll();
  }
  hitTest(playerX,playerZ,speed) {
    if(Math.abs(speed)<5)return 0; let hits=0;
    for(const item of this.items){
      if(item.active)continue;
      const dx=item.x-playerX,dz=item.z-playerZ;
      if(Math.abs(dx)<1.35&&Math.abs(dz)<1.9){
        item.active=true;item.life=1.1;item.vx=(dx<0?-1:1)*(1.8+Math.abs(speed)*.06);item.vy=2.4;item.vz=(dz<0?-1:1)*(1.4+Math.abs(speed)*.04);item.spin=(dx<0?-1:1)*(2+Math.abs(speed)*.08);hits++;
        EventBus.emit('chaosGain',this.eventPayload);
      }
    }
    return hits;
  }
  update(dt,playerZ) {
    for(let type=0;type<this.meshes.length;type++){
      const mesh=this.meshes[type];let index=0;
      for(const item of this.items){if(item.type!==type)continue;
        if(item.active){item.life-=dt;item.vy-=9.8*dt;item.x+=item.vx*dt;item.y=Math.max(.24,item.y+item.vy*dt);item.z+=item.vz*dt;item.rotation+=item.spin*dt;if(item.y<=.25)item.vy=Math.max(0,item.vy)*-.18;}
        if(item.life<=0||item.z>playerZ+80){item.active=false;item.x=item.baseX;item.z=item.baseZ;item.y=.32;item.vx=item.vy=item.vz=item.spin=item.rotation=0;item.life=0;}
        this.dummy.position.set(item.x,item.y,item.z);this.dummy.rotation.set(0,0,item.rotation);this.dummy.scale.setScalar(item.active?.88:1);this.dummy.scale.y*=TYPES[type].size[1]/.6;this.dummy.updateMatrix();mesh.setMatrixAt(index++,this.dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate=true;
    }
  }
  syncAll(){this.update(0,-Infinity);}
  dispose(){for(const mesh of this.meshes){this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}}
}
