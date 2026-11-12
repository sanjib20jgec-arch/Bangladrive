import * as THREE from 'three';

// Decorative, stationary figures live beyond the drivable road and have no gameplay collider.
export function createRoadsideCorner(scene) {
  const group = new THREE.Group();
  group.name = 'roadside-corner';
  const materials = {
    wood: new THREE.MeshStandardMaterial({ color: '#805b3e' }),
    roof: new THREE.MeshStandardMaterial({ color: '#c86842' }),
    cream: new THREE.MeshStandardMaterial({ color: '#e4c99b' }),
    skin: new THREE.MeshStandardMaterial({ color: '#a96e4b' }),
    tea: new THREE.MeshStandardMaterial({ color: '#2e786b' }),
    mechanic: new THREE.MeshStandardMaterial({ color: '#536c9c' }),
    dark: new THREE.MeshStandardMaterial({ color: '#30363b' }),
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const head = new THREE.SphereGeometry(.25, 8, 6);
  function block(parent, material, x, y, z, w, h, d) {
    const mesh = new THREE.Mesh(box, material);
    mesh.position.set(x, y, z); mesh.scale.set(w, h, d); parent.add(mesh);
  }
  // A compact stall and two roadside figures stay on the sidewalk, clear of objectives.
  block(group, materials.wood, 13.65, .55, -3, 1.9, 1.1, 2.3);
  block(group, materials.cream, 13.65, 1.15, -3, 2.05, .12, 2.45);
  block(group, materials.roof, 13.65, 2.45, -3, 2.3, .18, 2.8);
  for (const z of [-4.15, -1.85]) block(group, materials.wood, 14.45, 1.75, z, .1, 1.4, .1);
  block(group, materials.cream, 13.6, 1.3, -3, .25, .22, .25);
  function person(name, x, z, shirt) {
    const figure = new THREE.Group(); figure.name = name; figure.position.set(x, 0, z);
    block(figure, shirt, 0, 1.12, 0, .55, .7, .35);
    block(figure, materials.dark, -.15, .4, 0, .22, .75, .28);
    block(figure, materials.dark, .15, .4, 0, .22, .75, .28);
    const face = new THREE.Mesh(head, materials.skin); face.position.set(0, 1.72, 0); figure.add(face);
    group.add(figure);
    return figure;
  }
  const teaSeller = person('tea-seller', 12.2, -5.3, materials.tea);
  const mechanic = person('garage-mechanic', -12.4, -5.3, materials.mechanic);
  // A small tool chest identifies the mechanic without interactive hazards.
  block(group, materials.roof, -13.35, .38, -5.3, .8, .76, 1.05);
  scene.add(group);
  return { group, teaSeller, mechanic };
}
