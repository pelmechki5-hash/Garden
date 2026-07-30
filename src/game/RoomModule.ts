import * as THREE from 'three';

const concrete = new THREE.MeshStandardMaterial({ color: 0xaaa69a, roughness: 0.9 });
const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x55564f, roughness: 1 });
const ceiling = new THREE.MeshStandardMaterial({ color: 0xd0cbbd, roughness: 0.9 });
const metal = new THREE.MeshStandardMaterial({ color: 0x353934, metalness: .35, roughness: .55 });
const trim = new THREE.MeshStandardMaterial({ color: 0x706d61, roughness: .72 });
const wallpaper = new THREE.MeshStandardMaterial({ color: 0x817b67, roughness: .88 });
const fabric = new THREE.MeshStandardMaterial({ color: 0x594d3e, roughness: .95 });
const lamp = new THREE.MeshStandardMaterial({
  color: 0xffe8ad,
  emissive: 0xffc85f,
  emissiveIntensity: 2.8,
});

export type RoomKind = 'corridor' | 'office' | 'columns' | 'archive' | 'technical' | 'junction';

function box(group: THREE.Group, size: [number, number, number], at: [number, number, number], material = concrete) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...at);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export class RoomModule {
  readonly group = new THREE.Group();
  readonly light: THREE.PointLight;
  kind: RoomKind;
  lastChanged = 0;

  constructor(readonly index: number, x: number, z: number, yaw: number, kind: RoomKind) {
    this.kind = kind;
    this.group.position.set(x, 0, z);
    this.group.rotation.y = yaw;
    this.light = new THREE.PointLight(0xffd78b, 13, 13, 1.7);
    this.build();
  }

  rebuild(kind: RoomKind) {
    this.kind = kind;
    this.group.clear();
    this.build();
    this.lastChanged = performance.now();
  }

  private build() {
    const g = this.group;
    box(g, [10, .25, 18], [0, -.15, 0], darkConcrete);
    box(g, [10, .3, 18], [0, 5.2, 0], ceiling);
    [-5, 5].forEach((x) => {
      box(g, [.3, 5.4, 7.4], [x, 2.55, -5.3]);
      box(g, [.3, 5.4, 7.4], [x, 2.55, 5.3]);
      box(g, [.3, 1.1, 3.2], [x, 4.65, 0]);
    });
    this.addArchitecture();
    this.light.position.set(0, 4.45, 0);
    this.light.castShadow = true;
    g.add(this.light);

    if (this.kind === 'office') {
      box(g, [.06, 3.7, 17], [4.78, 2.15, 0], wallpaper);
      this.addDesk(2.5, -2);
      this.addChair(1.2, -1.7, 0);
      this.addChair(-2.6, 2.3, Math.PI);
    }
    if (this.kind === 'columns') {
      [-2.8, 2.8].forEach((x) => [-4, 4].forEach((z) => box(g, [.8, 5.2, .8], [x, 2.55, z])));
    }
    if (this.kind === 'archive') {
      [-3.9, 3.9].forEach((x) => {
        [-4.5, 0, 4.5].forEach((z) => box(g, [1.25, 3.8, 2.4], [x, 1.9, z], metal));
      });
    }
    if (this.kind === 'technical') {
      [-3.6, -3, 3, 3.6].forEach((x) => {
        box(g, [.18, .18, 14], [x, 4.3, 0], metal);
      });
      box(g, [3.2, 2.4, .45], [2.9, 1.3, -3.5], metal);
      box(g, [2.4, 1.5, 1.2], [-3.5, .75, 3], trim);
    }
    if (this.kind === 'junction') {
      [-1.4, 1.4].forEach((z) => {
        box(g, [.35, 5, .35], [-4.65, 2.5, z], metal);
        box(g, [.35, 5, .35], [4.65, 2.5, z], metal);
      });
      box(g, [.35, .35, 3.1], [-4.65, 4.8, 0], metal);
      box(g, [.35, .35, 3.1], [4.65, 4.8, 0], metal);
      this.addChair(0, 1.8, Math.PI / 2);
    }
  }

  private addArchitecture() {
    const g = this.group;
    [-6, 0, 6].forEach((z) => {
      box(g, [2.6, .1, .7], [0, 4.98, z], lamp);
      box(g, [9.5, .035, .035], [0, .02, z], trim);
    });
    [-4.82, 4.82].forEach((x) => {
      box(g, [.12, .55, 18], [x, .35, 0], trim);
      box(g, [.12, .18, 18], [x, 3.65, 0], trim);
    });
    [-3.2, 0, 3.2].forEach((x) => {
      box(g, [.025, .035, 18], [x, .02, 0], trim);
    });
    box(g, [.2, .2, 18], [-4.55, 4.72, 0], metal);
    [-6, 0, 6].forEach((z) => {
      const fill = new THREE.PointLight(0xffe2a3, 3.8, 8, 2);
      fill.position.set(0, 4.55, z);
      g.add(fill);
    });
  }

  private addDesk(x: number, z: number) {
    box(this.group, [3.2, .16, 1.45], [x, 1.05, z], darkConcrete);
    [-1.35, 1.35].forEach((offset) => {
      box(this.group, [.12, 1, .12], [x + offset, .5, z - .5], metal);
      box(this.group, [.12, 1, .12], [x + offset, .5, z + .5], metal);
    });
  }

  private addChair(x: number, z: number, yaw: number) {
    const chair = new THREE.Group();
    box(chair, [1.05, .18, 1.05], [0, .92, 0], fabric);
    box(chair, [1.05, 1.25, .18], [0, 1.55, .46], fabric);
    [-.4, .4].forEach((legX) => [-.4, .4].forEach((legZ) => {
      box(chair, [.09, .9, .09], [legX, .45, legZ], metal);
    }));
    chair.position.set(x, 0, z);
    chair.rotation.y = yaw;
    this.group.add(chair);
  }
}
