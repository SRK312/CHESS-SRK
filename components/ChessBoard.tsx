
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GameState, Piece, Square, Move, Arena } from '../types';
import { ChessEngine } from '../services/ChessEngine';

interface ChessBoardProps {
  arena: Arena;
  onMove: (move: Move) => void;
  onUndo: () => void;
  onRedo: () => void;
  canRedo: boolean;
  gameState: GameState;
  coins?: number;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ arena, onMove, onUndo, onRedo, canRedo, gameState, coins = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pieceMeshes = useRef<Map<string, THREE.Group>>(new Map());
  const moveIndicators = useRef<THREE.Group>(new THREE.Group());
  const coinsGroup = useRef<THREE.Group>(new THREE.Group());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const TILE_SIZE = 2.0;
  const BOARD_THICKNESS = 0.8;
  const PIECE_BASE_Y = BOARD_THICKNESS / 2;
  const BOARD_HALF = (TILE_SIZE * 8) / 2 - (TILE_SIZE / 2);

  const createReedingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 2048, 128);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 2048; i += 4) {
      ctx.fillRect(i, 0, 2, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const createCoinTexture = (type: string, style: 'solid' | 'outline') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;

    const bgGrad = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(512, 512, 480, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 740px serif';

    const solidMap: Record<string, string> = { 'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚' };
    const outlineMap: Record<string, string> = { 'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔' };
    const symbol = style === 'solid' ? solidMap[type] : outlineMap[type];

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillText(symbol || '♟', 525, 525);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(symbol || '♟', 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  };

  const createDetailedCoin = (type: string, style: 'solid' | 'outline') => {
    const coinGroup = new THREE.Group();
    const faceTexture = createCoinTexture(type, style);
    const reedingTexture = createReedingTexture();
    
    const bodyMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.15, 
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      bumpMap: reedingTexture,
      bumpScale: 0.005
    });

    const faceMat = new THREE.MeshPhysicalMaterial({ 
      map: faceTexture, 
      roughness: 0.1, 
      metalness: 0.3, 
      clearcoat: 0.8,
      reflectivity: 1.0
    });

    // Detailed numismatic profile with recessed center and raised rim
    const profilePoints = [
      new THREE.Vector2(0, -0.06),
      new THREE.Vector2(0.42, -0.06),
      new THREE.Vector2(0.42, -0.1),
      new THREE.Vector2(0.48, -0.1),
      new THREE.Vector2(0.5, -0.07),
      new THREE.Vector2(0.5, 0.07),
      new THREE.Vector2(0.48, 0.1),
      new THREE.Vector2(0.42, 0.1),
      new THREE.Vector2(0.42, 0.06),
      new THREE.Vector2(0, 0.06),
    ];
    
    const bodyGeo = new THREE.LatheGeometry(profilePoints, 128);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    coinGroup.add(body);

    const faceGeo = new THREE.CircleGeometry(0.42, 64);
    const topFace = new THREE.Mesh(faceGeo, faceMat);
    topFace.position.y = 0.061;
    topFace.rotation.x = -Math.PI / 2;
    coinGroup.add(topFace);

    const bottomFace = topFace.clone();
    bottomFace.position.y = -0.061;
    bottomFace.rotation.x = Math.PI / 2;
    coinGroup.add(bottomFace);

    coinGroup.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    return coinGroup;
  };

  const createStauntonMesh = (piece: Piece) => {
    const group = new THREE.Group();
    const isWhite = piece.color === 'w';
    
    const material = isWhite 
      ? new THREE.MeshPhysicalMaterial({ 
          color: 0xffffff,
          metalness: 0.1,
          roughness: 0.15,
          transmission: 0.7,
          thickness: 0.6,
          ior: 1.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          reflectivity: 1.0,
          emissive: 0xbae6fd,
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 1.0
        })
      : new THREE.MeshPhysicalMaterial({
          color: 0x0c0a09,
          metalness: 0.9,
          roughness: 0.4,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 0.8,
          emissive: 0xf97316,
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 1.0
        });

    const createLathe = (points: [number, number][], segments = 128) => {
      const geo = new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0] * TILE_SIZE, p[1] * TILE_SIZE)), segments);
      return new THREE.Mesh(geo, material);
    };

    let pieceBody: THREE.Object3D;
    const baseProfile: [number, number][] = [[0, 0], [0.42, 0], [0.42, 0.1], [0.38, 0.15], [0.38, 0.22], [0.32, 0.28], [0.28, 0.4]];
    switch (piece.type) {
      case 'p': pieceBody = createLathe([...baseProfile, [0.18, 0.55], [0.14, 0.85], [0.22, 0.9], [0.2, 1.0], [0.28, 1.2], [0, 1.3]]); break;
      case 'r': pieceBody = createLathe([...baseProfile, [0.28, 0.55], [0.28, 1.3], [0.36, 1.3], [0.36, 1.7], [0.32, 1.7], [0.32, 1.6], [0, 1.6]]); break;
      case 'n':
        pieceBody = new THREE.Group();
        const knightBase = createLathe([...baseProfile, [0.28, 0.55], [0.28, 0.9]]);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * TILE_SIZE, 0.3 * TILE_SIZE, 1.1 * TILE_SIZE, 32), material);
        neck.position.y = 1.2 * TILE_SIZE; neck.rotation.x = 0.4;
        const face = new THREE.Mesh(new THREE.BoxGeometry(0.32 * TILE_SIZE, 0.55 * TILE_SIZE, 0.85 * TILE_SIZE), material);
        face.position.set(0, 1.7 * TILE_SIZE, 0.3 * TILE_SIZE); face.rotation.x = -0.55;
        pieceBody.add(knightBase, neck, face);
        break;
      case 'b': pieceBody = createLathe([...baseProfile, [0.26, 0.55], [0.22, 1.3], [0.28, 1.4], [0.24, 1.8], [0.08, 2.0], [0, 2.1]]); break;
      case 'q': pieceBody = createLathe([...baseProfile, [0.28, 0.55], [0.2, 1.6], [0.4, 2.1], [0.32, 2.4], [0.12, 2.5], [0, 2.6]]); break;
      case 'k':
        pieceBody = new THREE.Group();
        const kingMain = createLathe([...baseProfile, [0.3, 0.55], [0.26, 1.8], [0.45, 2.3], [0.18, 2.5], [0, 2.6]]);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12 * TILE_SIZE, 0.5 * TILE_SIZE, 0.12 * TILE_SIZE), material);
        crossV.position.y = 2.9 * TILE_SIZE;
        pieceBody.add(kingMain, crossV);
        break;
      default: pieceBody = new THREE.Mesh(new THREE.SphereGeometry(0.5 * TILE_SIZE), material);
    }
    pieceBody.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });
    group.add(pieceBody);
    group.userData = { pieceId: piece.id, targetPos: new THREE.Vector3(0, 0, 0), isCaptured: false };
    return group;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(arena.skyColor);
    scene.fog = new THREE.FogExp2(arena.skyColor, 0.005);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(24, window.innerWidth / window.innerHeight, 0.1, 2000);
    const cameraY = window.innerWidth < 768 ? 48 : 36;
    const cameraZ = window.innerWidth < 768 ? 42 : 36;
    camera.position.set(0, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    scene.add(moveIndicators.current);

    const pieceTypes = ['k', 'q', 'r', 'b', 'n', 'p'];
    scene.add(coinsGroup.current);
    for (let i = 0; i < 12; i++) {
      const type = pieceTypes[i % pieceTypes.length];
      const style = i < 6 ? 'solid' : 'outline';
      const coin = createDetailedCoin(type, style);
      const angle = (i / 12) * Math.PI * 2;
      const dist = 30 + Math.random() * 5;
      coin.position.set(Math.cos(angle) * dist, 6 + Math.random() * 8, Math.sin(angle) * dist);
      coin.userData = { 
        rotSpeed: 0.3 + Math.random() * 0.5, 
        floatOffset: Math.random() * Math.PI * 2, 
        floatSpeed: 0.15 + Math.random() * 0.2 
      };
      coinsGroup.current.add(coin);
    }

    const frameGeo = new THREE.BoxGeometry(TILE_SIZE * 8 + 1.6, 2.6, TILE_SIZE * 8 + 1.6);
    const frameMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x020617, 
      metalness: 0.8, 
      roughness: 0.05, 
      clearcoat: 1.0 
    });
    const outerFrame = new THREE.Mesh(frameGeo, frameMat);
    outerFrame.position.y = -1.3;
    outerFrame.receiveShadow = true;
    scene.add(outerFrame);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 !== 0;
        const tileMat = new THREE.MeshPhysicalMaterial({ 
          color: isLight ? 0xe0f2fe : 0x0c0a09,
          metalness: 0.1, 
          roughness: 0.3, 
          reflectivity: 0.8 
        });
        const tile = new THREE.Mesh(new THREE.BoxGeometry(TILE_SIZE, BOARD_THICKNESS, TILE_SIZE), tileMat);
        tile.position.set(c * TILE_SIZE - BOARD_HALF, 0, r * TILE_SIZE - BOARD_HALF);
        tile.receiveShadow = true;
        tile.userData = { square: { row: r, col: c } };
        boardGroup.add(tile);
      }
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(40, 70, 40);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f9ff, 0.7);
    fillLight.position.set(-40, 30, -40);
    scene.add(fillLight);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      
      coinsGroup.current.children.forEach((coin) => {
        coin.rotation.y += delta * coin.userData.rotSpeed;
        coin.position.y += Math.sin(time * coin.userData.floatSpeed + coin.userData.floatOffset) * 0.015;
      });

      pieceMeshes.current.forEach((mesh, id) => {
        if (mesh.userData.isCaptured) {
          mesh.scale.multiplyScalar(0.9);
          mesh.position.y += delta * 3.0;
          mesh.traverse(child => {
            if (child instanceof THREE.Mesh && child.material) {
              const mat = child.material as THREE.MeshPhysicalMaterial;
              if (mat.opacity > 0) mat.opacity -= delta * 2.0;
            }
          });
          if (mesh.scale.x < 0.01) { scene.remove(mesh); pieceMeshes.current.delete(id); }
        } else {
          const target = mesh.userData.targetPos;
          const isSelected = mesh.userData.isSelected;
          const targetY = isSelected ? target.y + 1.0 : target.y;
          mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.x, 0.15);
          mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, target.z, 0.15);
          mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.2);
          if (isSelected) mesh.rotation.y += delta * 3.0;
          else mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.15);
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleInput = (clientX: number, clientY: number) => {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(boardGroup.children);
      if (intersects.length > 0) {
        const sq = intersects[0].object.userData.square as Square;
        (window as any).__chess_board_click?.(sq);
      }
    };

    const onMouseDown = (e: MouseEvent) => handleInput(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => handleInput(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchstart', onTouchStart);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchstart', onTouchStart);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [arena]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const activeIds = new Set<string>();
    gameState.board.forEach((row, r) => {
      row.forEach((p, c) => {
        if (p) {
          activeIds.add(p.id);
          let mesh = pieceMeshes.current.get(p.id);
          if (!mesh) {
            mesh = createStauntonMesh(p);
            scene.add(mesh);
            pieceMeshes.current.set(p.id, mesh);
            mesh.position.set(c * TILE_SIZE - BOARD_HALF, PIECE_BASE_Y, r * TILE_SIZE - BOARD_HALF);
          }
          mesh.userData.isCaptured = false;
          mesh.userData.targetPos.set(c * TILE_SIZE - BOARD_HALF, PIECE_BASE_Y, r * TILE_SIZE - BOARD_HALF);
          const isSelected = selectedSquare && gameState.board[selectedSquare.row][selectedSquare.col]?.id === p.id;
          mesh.userData.isSelected = !!isSelected;
        }
      });
    });
    pieceMeshes.current.forEach((m, id) => { if (!activeIds.has(id)) m.userData.isCaptured = true; });
  }, [gameState, selectedSquare]);

  useEffect(() => {
    (window as any).__chess_board_click = (sq: Square) => {
      const p = gameState.board[sq.row][sq.col];
      if (selectedSquare) {
        if (selectedSquare.row === sq.row && selectedSquare.col === sq.col) {
          setSelectedSquare(null);
        } else {
          const piece = gameState.board[selectedSquare.row][selectedSquare.col];
          if (piece) onMove({ from: selectedSquare, to: sq, piece });
          setSelectedSquare(null);
        }
      } else if (p && p.color === gameState.turn) {
        setSelectedSquare(sq);
      }
    };
  }, [gameState, selectedSquare, onMove]);

  useEffect(() => {
    if (!moveIndicators.current) return;
    moveIndicators.current.clear();
    if (selectedSquare) {
      const legalMoves = ChessEngine.getLegalMoves(gameState, selectedSquare);
      legalMoves.forEach(m => {
        const isCapture = !!gameState.board[m.to.row][m.to.col];
        const geo = new THREE.RingGeometry(isCapture ? 0.45 * TILE_SIZE : 0.15 * TILE_SIZE, isCapture ? 0.55 * TILE_SIZE : 0.3 * TILE_SIZE, 32);
        const mat = new THREE.MeshBasicMaterial({ color: isCapture ? 0xf43f5e : 0x22d3ee, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(m.to.col * TILE_SIZE - BOARD_HALF, PIECE_BASE_Y + 0.1, m.to.row * TILE_SIZE - BOARD_HALF);
        moveIndicators.current.add(mesh);
      });
    }
  }, [selectedSquare, gameState]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 touch-none">
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-4">
        <div className={`bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] border ${gameState.check ? 'border-red-500 shadow-xl' : 'border-slate-200 shadow-xl'} transition-all duration-700 min-w-[240px]`}>
           <div className="flex items-center gap-5">
              <div className={`w-3.5 h-3.5 rounded-full ${gameState.turn === 'w' ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-orange-500 shadow-[0_0_15px_#f97316]'} animate-pulse`} />
              <div className="space-y-0.5">
                <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400">Battle Phase</h2>
                <span className="text-2xl font-game text-slate-950 uppercase tracking-widest block leading-none">{gameState.turn === 'w' ? 'Glacial Order' : 'Ember Legion'}</span>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onUndo} disabled={gameState.history.length === 0} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all border shadow-xl ${gameState.history.length === 0 ? 'opacity-20 bg-slate-100 text-slate-300 border-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-950 hover:text-white active:scale-90'}`}><span className="text-2xl">↺</span></button>
          <button onClick={onRedo} disabled={!canRedo} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all border shadow-xl ${!canRedo ? 'opacity-20 bg-slate-100 text-slate-300 border-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-950 hover:text-white active:scale-90'}`}><span className="text-2xl scale-x-[-1]">↺</span></button>
        </div>
      </div>

      <div className="fixed top-8 right-24 z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 px-8 py-5 rounded-[2.5rem] shadow-xl flex items-center gap-6 pointer-events-auto">
           <div className="w-12 h-12 bg-white border-[3px] border-slate-950 rounded-full flex items-center justify-center shadow-lg overflow-hidden relative">
              <span className="text-slate-950 text-2xl font-black">♟</span>
           </div>
           <div>
              <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">War Chest</div>
              <div className="text-4xl font-game text-slate-950 leading-none">{coins}</div>
           </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-slate-200 shadow-2xl w-full">
          <div className="w-full flex overflow-x-auto gap-4 pb-1 px-1 scrollbar-hide pointer-events-auto snap-x">
            {gameState.history.length === 0 ? (
              <div className="w-full text-center text-slate-300 text-[10px] uppercase font-black tracking-[0.5em] py-5 italic">Tactical Maneuvers Awaiting...</div>
            ) : (
              gameState.history.map((m, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-4 bg-white border border-slate-100 px-5 py-4 rounded-2xl snap-center shadow-md">
                  <span className="text-[10px] text-slate-300 font-black">{i + 1}</span>
                  <span className={`font-black text-sm ${m.piece.color === 'w' ? 'text-cyan-500' : 'text-orange-600'}`}>{m.piece.type.toUpperCase()}</span>
                  <div className="flex items-center gap-3 text-slate-950 font-mono text-[11px] font-black"><span className="opacity-30">{String.fromCharCode(97 + m.from.col)}{m.from.row + 1}</span><span className="text-slate-200">→</span><span>{String.fromCharCode(97 + m.to.col)}{m.to.row + 1}</span></div>
                </div>
              )).reverse()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
