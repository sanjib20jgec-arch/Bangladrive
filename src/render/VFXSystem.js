import * as THREE from 'three';

export class VFXSystem {
  constructor(scene,{particles=128,skidPoints=420}={}){
    this.scene=scene;this.particleCount=particles;this.particles=new Array(particles);this.seed=0x6d2b79f5;this.head=0;this.dummy=new THREE.Object3D();this.color=new THREE.Color();
    for(let i=0;i<particles;i++)this.particles[i]={x:0,y:-10,z:0,vx:0,vy:0,vz:0,life:0,maxLife:1,scale:0,kind:0};
    this.particleMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,6,5),new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,transparent:true,opacity:.95,depthWrite:false}),particles);this.particleMesh.frustumCulled=false;this.particleMesh.count=particles;scene.add(this.particleMesh);
    const vertCount=skidPoints*4;this.positionArray=new Float32Array(vertCount*3);this.indices=new Uint32Array(skidPoints*12);
    for(let i=0;i<skidPoints;i++){const prev=((i+skidPoints-1)%skidPoints)*4,curr=i*4,o=i*12;this.indices.set([prev,prev+1,curr+1,prev,curr+1,curr,prev+2,prev+3,curr+3,prev+2,curr+3,curr+2],o);}
    this.skidGeometry=new THREE.BufferGeometry();this.positionAttribute=new THREE.BufferAttribute(this.positionArray,3);this.positionAttribute.setUsage(THREE.DynamicDrawUsage);this.skidGeometry.setAttribute('position',this.positionAttribute);this.skidGeometry.setIndex(new THREE.BufferAttribute(this.indices,1));this.skidGeometry.setDrawRange(0,0);this.skidGeometry.frustumCulled=false;
    this.skidMaterial=new THREE.MeshBasicMaterial({color:'#222321',transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false});this.skids=new THREE.Mesh(this.skidGeometry,this.skidMaterial);this.skids.frustumCulled=false;scene.add(this.skids);
    this.skidPoints=skidPoints;this.skidHead=0;this.skidCount=0;this.skidTimer=0;this.sparkTimer=0;this.flameTimer=0;
  }
  random(){let x=this.seed;x^=x<<13;x^=x>>>17;x^=x<<5;this.seed=x>>>0;return this.seed/4294967296;}
  spawn(x,y,z,vx,vy,vz,color,life,scale,kind){
    const i=this.head;this.head=(this.head+1)%this.particleCount;const p=this.particles[i];p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.life=life;p.maxLife=life;p.scale=scale;p.kind=kind;
    this.color.set(color);this.particleMesh.setColorAt(i,this.color);
  }
  addSkidPoint(x,y,z,yaw){
    const i=this.skidHead,o=i*12;const fX=Math.sin(yaw),fZ=-Math.cos(yaw),rX=Math.cos(yaw),rZ=Math.sin(yaw);const rearX=x-fX*1.18,rearZ=z-fZ*1.18;const attr=this.positionAttribute;
    for(let side=0;side<2;side++){const centerX=rearX+rX*(side===0?-.73:.73),centerZ=rearZ+rZ*(side===0?-.73:.73),offset=side*2;attr.setXYZ(i*4+offset,centerX-rX*.065,y,centerZ-rZ*.065);attr.setXYZ(i*4+offset+1,centerX+rX*.065,y,centerZ+rZ*.065);}
    this.skidHead=(i+1)%this.skidPoints;this.skidCount=Math.min(this.skidCount+1,this.skidPoints);attr.needsUpdate=true;
    if(this.skidCount<this.skidPoints)this.skidGeometry.setDrawRange(12,(this.skidCount-1)*12);else this.skidGeometry.setDrawRange(0,this.skidPoints*12);
  }
  update(dt,v){
    const fX=Math.sin(v.yaw),fZ=-Math.cos(v.yaw),rX=Math.cos(v.yaw),rZ=Math.sin(v.yaw);const activeDrift=v.drifting||v.handbrake;
    this.skidTimer-=dt;if(activeDrift&&Math.abs(v.speed)>5&&this.skidTimer<=0){this.addSkidPoint(v.x,.035,v.z,v.yaw);this.skidTimer=.045;}
    this.sparkTimer-=dt;if(v.drifting&&Math.abs(v.speed)>7&&this.sparkTimer<=0){const sparkColor=v.tier>=3?'#ffc34d':v.tier===2?'#ff8738':'#58bfff';for(let side=-1;side<=1;side+=2){const px=v.x-fX*1.3+rX*side*.74,pz=v.z-fZ*1.3+rZ*side*.74;this.spawn(px,.28,pz,(this.random()-.5)*1.8,.6+this.random()*1.7,(this.random()-.5)*1.8,sparkColor,.28+this.random()*.2,.6,0);}this.sparkTimer=.065;}
    this.flameTimer-=dt;if(v.nitro&&this.flameTimer<=0){const px=v.x-fX*2.05,pz=v.z-fZ*2.05;this.spawn(px,.43,pz,(this.random()-.5)*.25,-.05,(this.random()-.5)*.25,'#ff7a24',.22,.9,1);this.flameTimer=.035;}
    for(let i=0;i<this.particleCount;i++){const p=this.particles[i];if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=p.kind===0?2.4:-.3;this.dummy.position.set(p.x,p.y,p.z);this.dummy.scale.setScalar(p.scale*Math.max(0,p.life/p.maxLife));this.dummy.updateMatrix();this.particleMesh.setMatrixAt(i,this.dummy.matrix);}else{this.dummy.position.set(0,-20,0);this.dummy.scale.setScalar(0);this.dummy.updateMatrix();this.particleMesh.setMatrixAt(i,this.dummy.matrix);}}
    this.particleMesh.instanceMatrix.needsUpdate=true;if(this.particleMesh.instanceColor)this.particleMesh.instanceColor.needsUpdate=true;
  }
  dispose(){this.scene.remove(this.particleMesh,this.skids);this.particleMesh.geometry.dispose();this.particleMesh.material.dispose();this.skidGeometry.dispose();this.skidMaterial.dispose();}
}
