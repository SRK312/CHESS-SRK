
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// Fixed missing member errors by updating the import source to types.ts
import { Blade, GameStats } from '../types.ts';

interface GameCanvasProps {
  blade: Blade;
  onGameOver: (stats: GameStats) => void;
  onQuit: () => void;
}

// Particle class for juice splashes
class JuiceParticle extends THREE.Mesh {
  velocity: THREE.Vector3;
  life: number;
  constructor(color: number, position: THREE.Vector3) {
    const geometry = new THREE.SphereGeometry(0.06, 4, 4);
    const material = new THREE.MeshStandardMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.9,
    });
    super(geometry, material);
    (this as any).position.copy(position);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 7
    );
    this.life = 1.0;
  }
  update(delta: number) {
    (this as any).position.add(this.velocity.clone().multiplyScalar(delta));
    this.velocity.y -= 12 * delta; 
    this.life -= delta * 1.8;
    ((this as any).material as THREE.MeshStandardMaterial).opacity = this.life;
    (this as any).scale.multiplyScalar(0.97);
  }
}

class SlashEffect extends THREE.Mesh {
  life: number;
  constructor(p1: THREE.Vector3, p2: THREE.Vector3) {
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const length = direction.length();
    const geometry = new THREE.PlaneGeometry(0.12, length);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, // Blue slash for light theme contrast
      transparent: true, 
      opacity: 0.6,
      side: THREE.DoubleSide 
    });
    super(geometry, material);
    (this as any).position.addVectors(p1, p2).multiplyScalar(0.5);
    (this as any).quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    this.life = 0.12;
  }
  update(delta: number) {
    this.life -= delta;
    ((this as any).material as THREE.MeshBasicMaterial).opacity = this.life * 6;
  }
}

const GameCanvas: React.FC<GameCanvasProps> = ({ blade, onGameOver, onQuit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameActive = useRef(true);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimeout = useRef<number | null>(null);
  const fruitsSlicedRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Light Gray/Blue sky
    scene.fog = new THREE.Fog(0xf1f5f9, 5, 50);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- DECOR ---
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(100, 50, 0xcbd5e1, 0xf1f5f9);
    grid.position.y = -5.99;
    scene.add(grid);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(15, 30, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const bounceLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 0.6);
    scene.add(bounceLight);

    // --- FACTORIES ---
    const createCarrot = () => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.35, 1.3, 8), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
      body.castShadow = true;
      group.add(body);
      return group;
    };

    const createEggplant = () => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 10), new THREE.MeshStandardMaterial({ color: 0x581c87 }));
      body.castShadow = true;
      group.add(body);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0x166534 }));
      stem.position.y = 0.6;
      group.add(stem);
      return group;
    };

    const createBellPepper = () => {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1 }));
      body.castShadow = true;
      return body;
    };

    const createCorn = () => {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 10), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
      body.castShadow = true;
      return body;
    };

    const createTomato = () => {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      body.scale.set(1.1, 0.9, 1.1);
      body.castShadow = true;
      return body;
    };

    const createBomb = () => {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0xff0000, emissiveIntensity: 0.8 }));
      body.castShadow = true;
      return body;
    };

    const objects: THREE.Object3D[] = [];
    const particles: JuiceParticle[] = [];
    const slashes: SlashEffect[] = [];

    const spawnObject = () => {
      if (!gameActive.current) return;
      const isBomb = Math.random() < 0.15;
      let obj: THREE.Object3D;
      let pointValue = 10;
      let juiceColor = 0xffffff;

      if (isBomb) {
        obj = createBomb(); pointValue = 0;
      } else {
        const r = Math.random();
        if (r < 0.2) { obj = createCarrot(); pointValue = 25; juiceColor = 0xf97316; }
        else if (r < 0.4) { obj = createEggplant(); pointValue = 20; juiceColor = 0x581c87; }
        else if (r < 0.6) { obj = createBellPepper(); pointValue = 18; juiceColor = 0xef4444; }
        else if (r < 0.8) { obj = createCorn(); pointValue = 12; juiceColor = 0xeab308; }
        else { obj = createTomato(); pointValue = 10; juiceColor = 0xdc2626; }
      }

      const startX = (Math.random() - 0.5) * 8;
      obj.position.set(startX, -6, 0);
      obj.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1.6, 6 + Math.random() * 2, 0),
        angularVelocity: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.02),
        isBomb, isSliced: false, pointValue, juiceColor
      };
      scene.add(obj);
      objects.push(obj);
    };

    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;
    let lastMousePos = new THREE.Vector3();

    const handleSlice = (target: THREE.Object3D, intersectionPoint: THREE.Vector3) => {
      if (target.userData.isBomb) {
        livesRef.current--;
        scene.background = new THREE.Color(0xfecaca); // Red flash
        setTimeout(() => scene.background = new THREE.Color(0xf1f5f9), 100);
        if (livesRef.current <= 0) endGame();
      } else {
        target.userData.isSliced = true;
        const scoreGain = (target.userData.pointValue || 10) * (comboRef.current + 1);
        scoreRef.current += scoreGain;
        fruitsSlicedRef.current++;
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.innerText = scoreRef.current.toString();

        comboRef.current++;
        if (comboTimeout.current) clearTimeout(comboTimeout.current);
        comboTimeout.current = window.setTimeout(() => comboRef.current = 0, 750);

        // Juice
        for (let i = 0; i < 12; i++) {
          const p = new JuiceParticle(target.userData.juiceColor, intersectionPoint);
          scene.add(p);
          particles.push(p);
        }

        // Slash
        const slash = new SlashEffect(lastMousePos, intersectionPoint);
        scene.add(slash);
        slashes.push(slash);

        // Pieces
        target.visible = false;
        const splitOffset = new THREE.Vector3().subVectors(intersectionPoint, lastMousePos).normalize();
        const sepVec = new THREE.Vector3(-splitOffset.y, splitOffset.x, 0).normalize();

        for (let i = 0; i < 2; i++) {
          const piece = target.clone();
          piece.visible = true;
          piece.scale.multiplyScalar(0.8);
          piece.scale.x *= 0.5;
          piece.position.copy(target.position);
          piece.userData = {
            velocity: target.userData.velocity.clone().add(sepVec.clone().multiplyScalar(i === 0 ? -4 : 4)),
            angularVelocity: target.userData.angularVelocity.clone().multiplyScalar(6),
            isSliced: true
          };
          scene.add(piece);
          objects.push(piece);
        }
      }
    };

    const performRaycast = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      intersects.forEach(inter => {
        let t = inter.object;
        while (t.parent && t.parent !== scene) t = t.parent;
        if (t.userData && !t.userData.isSliced) handleSlice(t, inter.point);
      });
      const curPos = new THREE.Vector3();
      raycaster.ray.at(5, curPos);
      lastMousePos.copy(curPos);
    };

    const updateMouse = (x: number, y: number) => {
      mouse.x = (x / window.innerWidth) * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;
    };

    const onStart = (e: any) => {
      isMouseDown = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      updateMouse(x, y);
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.at(5, lastMousePos);
      performRaycast();
    };

    const onMove = (e: any) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      updateMouse(x, y);
      if (isMouseDown) performRaycast();
    };

    const onEnd = () => isMouseDown = false;

    window.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);

    const endGame = () => {
      gameActive.current = false;
      onGameOver({ score: scoreRef.current, combo: comboRef.current, maxCombo: comboRef.current, fruitsSliced: fruitsSlicedRef.current });
    };

    // --- LOOP ---
    const clock = new THREE.Clock();
    const gravity = -0.038;
    let spawnTimer = 0;

    const animate = () => {
      if (!gameActive.current) return;
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      spawnTimer += delta;
      if (spawnTimer > Math.max(0.7, 2.2 - scoreRef.current / 10000)) {
        spawnObject();
        spawnTimer = 0;
      }

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        obj.userData.velocity.y += gravity;
        obj.position.add(obj.userData.velocity.clone().multiplyScalar(delta * 2.8));
        obj.rotation.x += obj.userData.angularVelocity.x;
        obj.rotation.y += obj.userData.angularVelocity.y;
        if (obj.position.y < -12) { scene.remove(obj); objects.splice(i, 1); }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.update(delta);
        if (p.life <= 0) { scene.remove(p); particles.splice(i, 1); }
      }

      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i]; s.update(delta);
        if (s.life <= 0) { scene.remove(s); slashes.splice(i, 1); }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      gameActive.current = false;
      window.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      renderer.dispose();
    };
  }, [blade, onGameOver]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none flex flex-col p-8 md:p-12 select-none">
        <div className="flex justify-between items-start">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 shadow-xl">
            <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-3">Presence</div>
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full transition-all duration-700 ${i < livesRef.current ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          <div className="text-right bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 shadow-xl">
            <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Harvest</div>
            <div className="text-7xl font-game text-slate-900 tabular-nums" id="score-display">0</div>
          </div>
        </div>
        
        <div className="mt-auto text-center pb-8">
           <div className="inline-block bg-white/40 backdrop-blur-md px-10 py-4 rounded-full border border-slate-200 text-[10px] text-slate-400 uppercase tracking-[0.6em] font-black">
             Sunlight Dojo: Absolute Clarity
           </div>
        </div>
      </div>

      <button onClick={onQuit} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/80 hover:bg-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border border-slate-200 transition-all backdrop-blur-xl z-20 text-slate-600 shadow-lg">
        Pause Training
      </button>
    </div>
  );
};

export default GameCanvas;
