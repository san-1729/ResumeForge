import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ResumeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Create a group to hold all objects
    const group = new THREE.Group();
    scene.add(group);
    
    // Create document materials with different colors
    const documentMaterials = [
      new THREE.MeshBasicMaterial({ 
        color: 0x4f6ef7, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide 
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x4a9fff, 
        transparent: true, 
        opacity: 0.15,
        side: THREE.DoubleSide 
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x6e8eff, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide 
      })
    ];
    
    // Create resume document objects
    const documents: THREE.Mesh[] = [];
    const documentGeometry = new THREE.PlaneGeometry(1, 1.4);
    
    // Create 5 documents with random positions
    for (let i = 0; i < 5; i++) {
      const material = documentMaterials[i % documentMaterials.length];
      const document = new THREE.Mesh(documentGeometry, material);
      
      // Position randomly in 3D space
      document.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 2
      );
      
      // Random rotation
      document.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Random scale between 0.8 and 1.5
      const scale = 0.8 + Math.random() * 0.7;
      document.scale.set(scale, scale, scale);
      
      group.add(document);
      documents.push(document);
    }
    
    // Add text lines to simulate resume content
    const lineGeometry = new THREE.PlaneGeometry(0.7, 0.05);
    const lineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    // Add lines to each document
    documents.forEach(doc => {
      const numLines = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numLines; i++) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        // Position line on the document
        line.position.set(0, 0.3 - i * 0.2, 0.01);
        // Line width varies
        line.scale.x = 0.5 + Math.random() * 0.4;
        doc.add(line);
      }
    });
    
    // Add circles to represent skills or achievements
    const circleGeometry = new THREE.CircleGeometry(0.3, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4a9fff, 
      transparent: true, 
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    
    // Create circles
    for (let i = 0; i < 8; i++) {
      const circle = new THREE.Mesh(circleGeometry, circleMaterial);
      
      // Position randomly in 3D space
      circle.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3
      );
      
      // Random rotation
      circle.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Random scale
      const scale = 0.3 + Math.random() * 0.5;
      circle.scale.set(scale, scale, scale);
      
      group.add(circle);
    }
    
    // Set up animation
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Gently rotate the entire group
      group.rotation.x += 0.001;
      group.rotation.y += 0.002;
      
      // Animate individual documents
      documents.forEach((doc, index) => {
        // Different floating speeds for each document
        const floatSpeed = 0.001 + (index * 0.0005);
        doc.position.y += Math.sin(Date.now() * floatSpeed) * 0.003;
        doc.rotation.z += 0.001;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      documentGeometry.dispose();
      lineGeometry.dispose();
      circleGeometry.dispose();
      documentMaterials.forEach(material => material.dispose());
      lineMaterial.dispose();
      circleMaterial.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.8
      }}
    />
  );
} 