import * as THREE from 'three';
import { RoomModule, type RoomKind } from './RoomModule';

const roomKinds: RoomKind[] = [
  'corridor', 'office', 'columns', 'archive', 'technical', 'junction',
];
const statusText: Record<RoomKind, string> = {
  corridor: 'Коридор стал длиннее',
  office: 'За спиной появился офис',
  columns: 'Конструкция изменилась',
  archive: 'Архив переместился',
  technical: 'Появился технический отсек',
  junction: 'За спиной возникла развилка',
};

export class BlindSpotEngine {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(72, 1, .1, 90);
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private rooms: RoomModule[] = [];
  private keys = new Set<string>();
  private yaw = 0;
  private pitch = 0;
  private frame = 0;
  private nextMutation = 0;
  private mutationCount = 0;
  private audio?: AudioContext;
  private resizeObserver: ResizeObserver;

  constructor(
    private mount: HTMLDivElement,
    private onChange: (text: string) => void,
    private onPause: (paused: boolean) => void,
  ) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.mount.prepend(this.renderer.domElement);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(mount);
    this.setupWorld();
    this.bindEvents();
    this.resize();
    this.tick();
  }

  start() {
    this.renderer.domElement.requestPointerLock();
    this.startAmbience();
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.audio?.close();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    document.removeEventListener('mousemove', this.look);
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    document.removeEventListener('pointerlockchange', this.lockChange);
  }

  private setupWorld() {
    this.scene.background = new THREE.Color(0x292a24);
    this.scene.fog = new THREE.FogExp2(0x393a32, .018);
    this.scene.add(new THREE.HemisphereLight(0xe8e2cf, 0x292a25, 1.15));
    this.camera.position.set(0, 1.65, 7);
    const layout: Array<[number, number, number]> = [
      [0, 0, 0], [0, -18, 0], [0, -36, 0],
      [14, -36, Math.PI / 2], [32, -36, Math.PI / 2],
      [32, -54, 0], [32, -72, 0],
      [18, -72, Math.PI / 2], [0, -72, Math.PI / 2],
      [0, -90, 0], [0, -108, 0],
      [-14, -108, Math.PI / 2], [-32, -108, Math.PI / 2],
      [-32, -126, 0], [-32, -144, 0],
      [14, -18, Math.PI / 2], [32, -18, Math.PI / 2],
      [18, -90, Math.PI / 2], [36, -90, Math.PI / 2],
      [-14, -54, Math.PI / 2], [-32, -54, Math.PI / 2],
    ];
    layout.forEach(([x, z, yaw], index) => {
      const room = new RoomModule(index, x, z, yaw, roomKinds[index % roomKinds.length]);
      this.rooms.push(room);
      this.scene.add(room.group);
    });
  }

  private bindEvents() {
    document.addEventListener('mousemove', this.look);
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    document.addEventListener('pointerlockchange', this.lockChange);
  }

  private look = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.renderer.domElement) return;
    this.yaw -= event.movementX * .002;
    this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * .002, -1.25, 1.25);
  };

  private keyDown = (event: KeyboardEvent) => this.keys.add(event.code);
  private keyUp = (event: KeyboardEvent) => this.keys.delete(event.code);
  private lockChange = () => this.onPause(document.pointerLockElement !== this.renderer.domElement);

  private update(delta: number) {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    const right = new THREE.Vector3(-direction.z, 0, direction.x);
    const movement = new THREE.Vector3();
    if (this.keys.has('KeyW')) movement.add(direction);
    if (this.keys.has('KeyS')) movement.sub(direction);
    if (this.keys.has('KeyD')) movement.add(right);
    if (this.keys.has('KeyA')) movement.sub(right);
    if (movement.lengthSq()) movement.normalize().multiplyScalar(delta * 3.8);
    const previous = this.camera.position.clone();
    this.camera.position.add(movement);
    if (!this.isInsideRoom(this.camera.position)) this.camera.position.copy(previous);
    if (this.camera.position.z < -138) this.onChange('Вы нашли глубокий сектор');
    this.mutateInvisibleRoom();
  }

  private mutateInvisibleRoom() {
    const now = performance.now();
    if (now < this.nextMutation) return;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    const candidates = this.rooms.filter((room) => {
      const toRoom = room.group.position.clone().sub(this.camera.position);
      const distance = toRoom.length();
      const angle = forward.angleTo(toRoom.normalize());
      return distance > 14 && (angle > 1.15 || distance > 65);
    });
    if (!candidates.length) return;
    candidates.sort((a, b) => (
      a.group.position.distanceTo(this.camera.position)
      - b.group.position.distanceTo(this.camera.position)
    ));
    const nearby = candidates.slice(0, 4);
    const room = nearby[Math.floor(Math.random() * nearby.length)];
    const options = roomKinds.filter((kind) => kind !== room.kind);
    const next = options[Math.floor(Math.random() * options.length)];
    room.rebuild(next);
    room.light.visible = Math.random() > .08;
    this.onChange(statusText[next]);
    window.setTimeout(() => this.onChange('Пространство стабильно'), 2400);
    this.mutationCount += 1;
    if (this.mutationCount % 3 === 0) {
      const offset = room.group.rotation.y ? 'по боковому проходу' : 'за поворотом';
      this.onChange(`${statusText[next]} ${offset}`);
    }
    this.nextMutation = now + 1800 + Math.random() * 2200;
  }

  private isInsideRoom(point: THREE.Vector3) {
    return this.rooms.some((room) => {
      const local = room.group.worldToLocal(point.clone());
      return Math.abs(local.x) < 4.45 && Math.abs(local.z) < 9.1;
    });
  }

  private tick = () => {
    const delta = Math.min(.04, this.clock.getDelta());
    if (document.pointerLockElement === this.renderer.domElement) this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };

  private clock = new THREE.Clock();

  private resize() {
    const { clientWidth, clientHeight } = this.mount;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  }

  private startAmbience() {
    if (this.audio) return;
    this.audio = new AudioContext();
    const hum = this.audio.createOscillator();
    const gain = this.audio.createGain();
    hum.type = 'sine';
    hum.frequency.value = 52;
    gain.gain.value = .018;
    hum.connect(gain).connect(this.audio.destination);
    hum.start();
  }
}
