import * as THREE from 'three';
export class NavigationChevrons {
  constructor(scene,count=12){
    this.scene=scene;this.count=count;this.clock=0;this.targetX=0;this.dummy=new THREE.Object3D();this.mesh=new THREE.InstancedMesh(new THREE.ShapeGeometry(this.makeShape()),new THREE.MeshBasicMaterial({color:'#48e8ed',transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false}),count);this.mesh.frustumCulled=false;scene.add(this.mesh);this.update(0,0,0);
  }
  makeShape(){const s=new THREE.Shape();s.moveTo(-.85,-.42);s.lineTo(0,.58);s.lineTo(.85,-.42);s.lineTo(.42,-.42);s.lineTo(0,.02);s.lineTo(-.42,-.42);s.closePath();return s;}
  update(dt,playerX,playerZ){this.clock+=dt;this.targetX=playerX< -2?3.3:playerX>2?-3.3:0;for(let i=0;i<this.count;i++){const t=(i+1)/(this.count+1);const z=playerZ-8-i*6.5;const x=playerX+(this.targetX-playerX)*t;this.dummy.position.set(x,.035,z);this.dummy.rotation.set(-Math.PI/2,0,0);const pulse=.82+Math.sin(this.clock*4-i*.55)*.12;this.dummy.scale.set(pulse,pulse,pulse);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);}this.mesh.material.opacity=.62+Math.sin(this.clock*3)*.1;this.mesh.instanceMatrix.needsUpdate=true;}
  dispose(){this.scene.remove(this.mesh);this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
