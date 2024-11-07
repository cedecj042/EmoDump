import { Injectable } from '@angular/core';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/src/loaders';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

@Injectable({
  providedIn: 'root'
})
export class EngineSerivce {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  constructor() { }

  initialize(canvas: HTMLCanvasElement, width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    const aspectRatio = width / height;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderLoop();
  }

  private renderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
