"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const objects: THREE.Mesh[] = [];
    const geometry = new THREE.PlaneGeometry(1, 1.4);

    const createTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 358;
        const context = canvas.getContext('2d');
        if (!context) return new THREE.CanvasTexture(canvas);

        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#e0e0e0';
        context.fillRect(20, 20, 80, 20);
        for (let i = 0; i < 5; i++) {
            context.fillRect(20, 60 + i * 30, Math.random() * 150 + 60, 15);
        }
        context.fillRect(20, 250, 216, 30);
        return new THREE.CanvasTexture(canvas);
    };

    const material = new THREE.MeshBasicMaterial({
        map: createTexture(),
        side: THREE.DoubleSide,
    });

    for (let i = 0; i < 50; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
      };
      scene.add(mesh);
      objects.push(mesh);
    }

    let mouseX = 0, mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      objects.forEach(obj => {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
      });
      
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      const texture = material.map as THREE.CanvasTexture;
      if (texture) {
          texture.dispose();
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}
