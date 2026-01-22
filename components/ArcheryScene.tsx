
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Bow, GameState, Vector3 } from '../types.ts';
import { GRAVITY } from '../constants.ts';

interface ArcherySceneProps {
  bow: Bow;
  gameState: GameState;
  onHit: (score: number) => void;
}

const ArcheryScene: React.FC<ArcherySceneProps> = ({ bow, gameState, onHit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRef = useRef<THREE.Group | null>(null);
  const arrowRef = useRef<THREE.Group | null>(null);
  const bowRef = useRef<THREE.Group | null>(null);
  
  const interactionState = useRef({
    isMouseDown: false,
    startY: 0,
    drawPower: 0,
    isArrowInFlight: false,
    arrowVelocity: new THREE.Vector3(),
    arrowPosition: new THREE.Vector3()
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Eye level
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // --- ENVIRONMENT ---
    const grassGeo = new THREE.PlaneGeometry(200, 200);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // --- TARGET ---
    const createTarget = () => {
      const group = new THREE.Group();
      const colors = [0xffffff, 0x000000, 0x0ea5e9, 0xf43f5e, 0xfacc15]; // White, Black, Blue, Red, Yellow
      for (let i = 0; i < 5; i++) {
        const radius = (5 - i) * 0.2;
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: colors[i] })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.z = i * 0.01;
        group.add(ring);
      }
      const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.5, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      stand.position.y = -0.75;
      group.add(stand);
      return group;
    };

    const target = createTarget();
    target.position.set(0, 1.5, -gameState.currentDistance);
    scene.add(target);
    targetRef.current = target;

    // --- LIGHTS ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    // --- BOW & ARROW ---
    const createBow = () => {
      const group = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.6, 0),
        new THREE.Vector3(0.1, 0.3, 0),
        new THREE.Vector3(0.15, 0, 0),
        new THREE.Vector3(0.1, -0.3, 0),
        new THREE.Vector3(0, -0.6, 0),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
      const bowMesh = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ color: bow.color }));
      group.add(bowMesh);

      // String
      const stringGeo = new THREE.CylinderGeometry(0.002, 0.002, 1.2);
      const stringMesh = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      stringMesh.position.x = 0;
      group.add(stringMesh);
      
      return group;
    };

    const bowGroup = createBow();
    bowGroup.position.set(0.2, 1.4, -0.5);
    scene.add(bowGroup);
    bowRef.current = bowGroup;

    const createArrow = () => {
      const group = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.7), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
      shaft.rotation.x = Math.PI / 2;
      group.add(shaft);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      head.position.z = -0.35;
      head.rotation.x = -Math.PI / 2;
      group.add(head);
      return group;
    };

    const arrow = createArrow();
    arrow.position.set(0.2, 1.4, -0.5);
    scene.add(arrow);
    arrowRef.current = arrow;

    // --- RENDER LOOP ---
    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      // Sway (Breathing)
      if (cameraRef.current) {
        const swayAmount = 0.005 * (1.1 - bow.stability);
        cameraRef.current.position.y = 1.6 + Math.sin(time * 2) * swayAmount;
        cameraRef.current.position.x = Math.cos(time * 1.5) * swayAmount;
      }

      // Physics
      if (interactionState.current.isArrowInFlight && arrowRef.current) {
        const delta = 0.016; // Approx 60fps
        const pos = interactionState.current.arrowPosition;
        const vel = interactionState.current.arrowVelocity;

        // Apply forces
        vel.y += GRAVITY * delta;
        vel.x += gameState.wind.direction.x * gameState.wind.speed * delta * 0.1;

        pos.add(vel.clone().multiplyScalar(delta));
        arrowRef.current.position.copy(pos);
        arrowRef.current.lookAt(pos.clone().add(vel));

        // Collision Check
        if (targetRef.current && pos.z <= targetRef.current.position.z) {
          interactionState.current.isArrowInFlight = false;
          
          const dist = pos.distanceTo(targetRef.current.position);
          let hitScore = 0;
          if (dist < 0.2) hitScore = 10;
          else if (dist < 0.4) hitScore = 8;
          else if (dist < 0.6) hitScore = 6;
          else if (dist < 0.8) hitScore = 4;
          else if (dist < 1.0) hitScore = 2;

          onHit(hitScore);

          // Reset arrow after impact
          setTimeout(() => {
            if (arrowRef.current) {
              arrowRef.current.position.set(0.2, 1.4, -0.5);
              arrowRef.current.rotation.set(0, 0, 0);
            }
          }, 1000);
        }

        // Ground check
        if (pos.y <= 0) {
          interactionState.current.isArrowInFlight = false;
          onHit(0);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- EVENTS ---
    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      if (interactionState.current.isArrowInFlight) return;
      interactionState.current.isMouseDown = true;
      interactionState.current.startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!interactionState.current.isMouseDown) return;
      const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const diff = Math.max(0, currentY - interactionState.current.startY);
      interactionState.current.drawPower = Math.min(1.0, diff / 200);
      
      if (arrowRef.current && bowRef.current) {
        const d = interactionState.current.drawPower * 0.3;
        arrowRef.current.position.z = -0.5 + d;
        bowRef.current.children[1].position.z = d; // String pull
      }
    };

    const onMouseUp = () => {
      if (!interactionState.current.isMouseDown) return;
      interactionState.current.isMouseDown = false;
      
      const power = interactionState.current.drawPower;
      if (power > 0.1 && arrowRef.current) {
        interactionState.current.isArrowInFlight = true;
        interactionState.current.arrowPosition.copy(arrowRef.current.position);
        interactionState.current.arrowVelocity.set(0, 0.5 * power, -bow.tensionPower * power);
      }
      
      interactionState.current.drawPower = 0;
      if (bowRef.current) bowRef.current.children[1].position.z = 0;
    };

    const onResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onMouseDown);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [bow, gameState.currentDistance]);

  // Update target distance when it changes
  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.position.z = -gameState.currentDistance;
    }
  }, [gameState.currentDistance]);

  return <div ref={containerRef} className="w-full h-full cursor-crosshair" />;
};

export default ArcheryScene;
