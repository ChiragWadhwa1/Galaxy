
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { ParticleParams, ParticleMode, InteractionPoint } from '../types';

interface ParticleSceneProps {
  params: ParticleParams;
  interactionPoint: InteractionPoint;
}

const ParticleScene: React.FC<ParticleSceneProps> = ({ params, interactionPoint }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const clock = useMemo(() => new THREE.Clock(), []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const sizes = new Float32Array(params.count);

    const color1 = new THREE.Color(params.color1);
    const color2 = new THREE.Color(params.color2);

    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;
      const r = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: params.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const positionsArr = posAttr.array as Float32Array;

        for (let i = 0; i < params.count; i++) {
          const i3 = i * 3;
          let x = positionsArr[i3];
          let y = positionsArr[i3 + 1];
          let z = positionsArr[i3 + 2];

          // Interaction Logic
          if (interactionPoint.active) {
            const dx = interactionPoint.x - x;
            const dy = interactionPoint.y - y;
            const dz = interactionPoint.z - z;
            const distSq = dx*dx + dy*dy + dz*dz;
            const dist = Math.sqrt(distSq);
            
            if (dist < 3) {
              const force = (3 - dist) * 0.02;
              positionsArr[i3] += dx * force;
              positionsArr[i3 + 1] += dy * force;
              positionsArr[i3 + 2] += dz * force;
            }
          }

          const speed = params.speed * 0.2;
          const complexity = params.complexity;

          switch (params.mode) {
            case ParticleMode.ORBIT:
              const angle = speed * 0.1;
              const nextX = x * Math.cos(angle) - z * Math.sin(angle);
              const nextZ = x * Math.sin(angle) + z * Math.cos(angle);
              positionsArr[i3] = nextX;
              positionsArr[i3 + 2] = nextZ;
              break;

            case ParticleMode.GALAXY:
              const distG = Math.sqrt(x*x + z*z);
              const spiral = 1.0 / (distG + 0.1) * speed;
              const sAngle = spiral * 0.5;
              positionsArr[i3] = x * Math.cos(sAngle) - z * Math.sin(sAngle);
              positionsArr[i3 + 2] = x * Math.sin(sAngle) + z * Math.cos(sAngle);
              positionsArr[i3 + 1] += Math.sin(elapsedTime * speed + distG * 2) * 0.002;
              break;

            case ParticleMode.VORTEX:
              const vDist = Math.sqrt(x*x + z*z);
              const vAngle = (1.5 / (vDist + 0.5)) * speed;
              positionsArr[i3] = x * Math.cos(vAngle) - z * Math.sin(vAngle);
              positionsArr[i3 + 2] = x * Math.sin(vAngle) + z * Math.cos(vAngle);
              positionsArr[i3 + 1] += (Math.sin(vDist * 2 - elapsedTime) * 0.01) * complexity;
              break;

            case ParticleMode.FLOW:
              positionsArr[i3] += Math.sin(y * 0.5 + elapsedTime * speed) * 0.01;
              positionsArr[i3 + 1] += Math.cos(x * 0.5 + elapsedTime * speed) * 0.01;
              positionsArr[i3 + 2] += Math.sin(z * 0.5 + elapsedTime * speed) * 0.01;
              break;

            case ParticleMode.CHAOS:
              positionsArr[i3] += (Math.random() - 0.5) * 0.05 * speed;
              positionsArr[i3 + 1] += (Math.random() - 0.5) * 0.05 * speed;
              positionsArr[i3 + 2] += (Math.random() - 0.5) * 0.05 * speed;
              break;

            case ParticleMode.EXPAND:
              const mag = Math.sqrt(x*x + y*y + z*z);
              const dirX = x / mag;
              const dirY = y / mag;
              const dirZ = z / mag;
              positionsArr[i3] += dirX * 0.02 * speed;
              positionsArr[i3 + 1] += dirY * 0.02 * speed;
              positionsArr[i3 + 2] += dirZ * 0.02 * speed;
              if (mag > 10) {
                 positionsArr[i3] = (Math.random() - 0.5) * 0.5;
                 positionsArr[i3 + 1] = (Math.random() - 0.5) * 0.5;
                 positionsArr[i3 + 2] = (Math.random() - 0.5) * 0.5;
              }
              break;
          }
        }
        posAttr.needsUpdate = true;
        particlesRef.current.rotation.y += 0.001 * params.speed;
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [params.count]);

  useEffect(() => {
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.size = params.size;
      mat.opacity = 0.8 * params.brightness;
      
      const colors = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const c1 = new THREE.Color(params.color1);
      const c2 = new THREE.Color(params.color2);
      
      for (let i = 0; i < params.count; i++) {
        const mixed = c1.clone().lerp(c2, Math.random());
        colors.setXYZ(i, mixed.r, mixed.g, mixed.b);
      }
      colors.needsUpdate = true;
    }
  }, [params.color1, params.color2, params.size, params.brightness, params.count]);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none" />;
};

export default ParticleScene;
