import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PointerLockControls, Box, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Camera, Compass, MapPin } from 'lucide-react';

function Player({ isThirdPerson }) {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ w: false, a: false, s: false, d: false });
  const playerRef = useRef(new THREE.Vector3(0, 1.6, 5));
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const speed = 5;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w') setMovement((m) => ({ ...m, w: true }));
      if (e.key.toLowerCase() === 'a') setMovement((m) => ({ ...m, a: true }));
      if (e.key.toLowerCase() === 's') setMovement((m) => ({ ...m, s: true }));
      if (e.key.toLowerCase() === 'd') setMovement((m) => ({ ...m, d: true }));
    };
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') setMovement((m) => ({ ...m, w: false }));
      if (e.key.toLowerCase() === 'a') setMovement((m) => ({ ...m, a: false }));
      if (e.key.toLowerCase() === 's') setMovement((m) => ({ ...m, s: false }));
      if (e.key.toLowerCase() === 'd') setMovement((m) => ({ ...m, d: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    // Determine movement direction based on camera rotation
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(movement.s) - Number(movement.w));
    const sideVector = new THREE.Vector3(Number(movement.a) - Number(movement.d), 0, 0);
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed * delta);
    direction.applyEuler(camera.rotation);
    
    // Update player position
    playerRef.current.add(direction);
    
    // Floor collision
    if (playerRef.current.y < 1.6) playerRef.current.y = 1.6;

    // Apply to camera
    if (isThirdPerson) {
      // 3rd Person: Camera behind and above the player
      const offset = new THREE.Vector3(0, 1, 3);
      offset.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
      camera.position.copy(playerRef.current).add(offset);
    } else {
      // 1st Person: Camera is inside the player's head
      camera.position.copy(playerRef.current);
    }
  });

  return (
    <>
      <PointerLockControls />
      {/* Render the Avatar only if in Third Person */}
      {isThirdPerson && (
        <group position={[playerRef.current.x, playerRef.current.y - 0.6, playerRef.current.z]}>
          <Box args={[0.6, 1.2, 0.6]} castShadow>
            <meshToonMaterial color="#007aff" />
            <Edges color="#1d1d1f" threshold={15} />
          </Box>
          {/* Head */}
          <Box args={[0.4, 0.4, 0.4]} position={[0, 0.8, 0]} castShadow>
            <meshToonMaterial color="#ffccaa" />
            <Edges color="#1d1d1f" threshold={15} />
          </Box>
        </group>
      )}
    </>
  );
}

function GlowRing({ position }) {
  const ringRef = useRef();
  useFrame(() => {
    if (ringRef.current) ringRef.current.rotation.z += 0.02;
  });
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
      <ringGeometry args={[0.6, 0.8, 32]} />
      <meshBasicMaterial color="#ffcc00" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function RepresentativeBuilding() {
  return (
    <group>
      {/* Floor Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshToonMaterial color="#e0cda5" />
      </mesh>

      {/* Student Center Sign (Billboard) */}
      <Html position={[0, 4, -4.9]} center className="pointer-events-none">
        <div className="bg-[#f4e8d1] border-4 border-[#8b5a2b] px-5 py-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#4a3b32] font-black whitespace-nowrap text-xl relative flex items-center">
          <MapPin size={20} className="mr-2 text-[#c62828] animate-bounce" />
          綜合大樓 (MVP)
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f4e8d1] border-r-4 border-b-4 border-[#8b5a2b] transform rotate-45"></div>
        </div>
      </Html>

      {/* Back Wall */}
      <Box args={[20, 5, 0.5]} position={[0, 2.5, -5]} castShadow receiveShadow>
        <meshToonMaterial color="#f5f5f7" />
        <Edges color="#8b5a2b" threshold={15} />
      </Box>

      {/* Cafeteria Booth */}
      <group position={[-5, 0, -3]}>
        <GlowRing position={[0, 0.01, 2]} />
        <Box args={[4, 1.5, 1]} position={[0, 0.75, 0]} castShadow receiveShadow>
          <meshToonMaterial color="#ff9500" />
          <Edges color="#4a3b32" threshold={15} />
        </Box>
        <Html position={[0, 2.5, 0]} center className="pointer-events-none">
          <div className="bg-[#8b5a2b] border-2 border-[#4a3b32] px-3 py-1.5 rounded shadow-lg text-[#f4e8d1] font-bold whitespace-nowrap text-sm flex items-center">
            校園餐廳檔口
          </div>
        </Html>
      </group>

      {/* Classroom Setup */}
      <group position={[5, 0, -3]}>
        <GlowRing position={[-2, 0.01, 3]} />
        {/* Doorway / Opening representation */}
        <Box args={[1, 3, 0.1]} position={[-2, 1.5, 2]} castShadow receiveShadow>
          <meshToonMaterial color="#86868b" />
          <Edges color="#1d1d1f" threshold={15} />
        </Box>
        <Html position={[-2, 3.5, 2]} center className="pointer-events-none">
          <div className="bg-[#4a3b32] border-2 border-[#d2b48c] px-3 py-1.5 rounded shadow-lg text-[#f4e8d1] font-bold whitespace-nowrap text-sm">
            教室 101
          </div>
        </Html>
        {/* Teacher Desk inside */}
        <Box args={[2, 1, 1]} position={[0, 0.5, -1]} castShadow receiveShadow>
          <meshToonMaterial color="#007aff" />
          <Edges color="#1d1d1f" threshold={15} />
        </Box>
      </group>
      
      {/* Fake Stairs representing access to 2nd Floor */}
      <group position={[0, 0, 2]}>
        <Box args={[2, 0.2, 1]} position={[0, 0.1, 0]} castShadow receiveShadow>
           <meshToonMaterial color="#4a3b32" />
           <Edges color="#1d1d1f" threshold={15} />
        </Box>
        <Box args={[2, 0.2, 1]} position={[0, 0.3, 1]} castShadow receiveShadow>
           <meshToonMaterial color="#4a3b32" />
           <Edges color="#1d1d1f" threshold={15} />
        </Box>
        <Box args={[2, 0.2, 1]} position={[0, 0.5, 2]} castShadow receiveShadow>
           <meshToonMaterial color="#4a3b32" />
           <Edges color="#1d1d1f" threshold={15} />
        </Box>
        <Html position={[0, 1.2, 1]} center className="pointer-events-none">
          <div className="bg-transparent border-2 border-[#8b5a2b] bg-[#f4e8d1]/90 px-3 py-1 rounded-sm shadow-md text-[#4a3b32] font-black text-sm rotate-[-5deg]">
            往二樓 (施工中)
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function Campus3D() {
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'v') {
        setIsThirdPerson(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="glass rounded-3xl overflow-hidden w-full h-[700px] relative shadow-2xl border-4 border-[#8b5a2b] bg-[#e0cda5]">
      
      {/* Pixel Font Import for UI */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        .jrpg-font { font-family: 'DotGothic16', sans-serif; }
      `}} />

      {/* Top Left JRPG HUD overlay */}
      <div className="absolute top-6 left-6 z-10 bg-[#4a3b32]/90 border-2 border-[#d2b48c] rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-[300px] backdrop-blur-sm jrpg-font">
        <h3 className="text-[#ffcc00] text-xl font-bold mb-3 flex items-center border-b border-[#8b5a2b] pb-2">
          <Camera size={20} className="mr-2" /> 視角與操作
        </h3>
        <div className="space-y-2 text-[#f4e8d1] text-md leading-relaxed tracking-wide">
          <p>🖱️ 點擊畫面：鎖定視角 (ESC 解除)</p>
          <p>⌨️ WASD：控制角色移動</p>
          <p>🔄 V 鍵：切換一/三人稱視角</p>
        </div>
        <button 
          onClick={() => setIsThirdPerson(!isThirdPerson)}
          className="mt-4 w-full bg-[#8b5a2b] text-[#f4e8d1] py-2 rounded-lg hover:bg-[#7a6350] transition-colors border border-[#d2b48c] shadow-inner font-bold text-lg"
        >
          {isThirdPerson ? '第三人稱視角' : '第一人稱視角'}
        </button>
      </div>
      
      {/* Bottom Right Minimap HUD */}
      <div className="absolute bottom-6 right-6 z-10 w-40 h-40 bg-[#f4e8d1]/80 border-4 border-[#8b5a2b] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden backdrop-blur-sm">
        {/* Radar grids */}
        <div className="absolute w-1 h-full bg-[#8b5a2b]/30"></div>
        <div className="absolute h-1 w-full bg-[#8b5a2b]/30"></div>
        <div className="absolute w-[70%] h-[70%] rounded-full border border-[#8b5a2b]/30"></div>
        
        {/* Compass Needle */}
        <Compass size={40} className="text-[#c62828] drop-shadow-md animate-pulse z-10" />
        
        {/* Radar Ping */}
        <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#c62828]/20"></span>
        <span className="absolute bottom-3 text-xs font-black text-[#4a3b32] bg-[#f4e8d1] px-2 rounded-full border border-[#8b5a2b] z-20 jrpg-font">MAP</span>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 60 }}>
        {/* Warm ambient light for JRPG feel */}
        <ambientLight intensity={0.7} color="#ffe8b5" />
        <directionalLight castShadow position={[10, 10, 5]} intensity={1.2} shadow-mapSize={[1024, 1024]} color="#fff5d7" />
        <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
        <RepresentativeBuilding />
        <Player isThirdPerson={isThirdPerson} />
      </Canvas>
    </div>
  );
}
