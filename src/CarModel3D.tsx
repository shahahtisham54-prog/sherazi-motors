import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = { lightsOn: boolean; rotating: boolean };

export function CarModel3D({ lightsOn, rotating }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneState = useRef<{ headlights: THREE.MeshStandardMaterial[]; group: THREE.Group } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.1, 2.8, 6.2);
    camera.lookAt(0, 0.72, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D silver sports car. Drag to rotate.');
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'pan-y';
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe8f1ff, 0x263238, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffe5bd, 3.2);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x8dbbd2, 2.3);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);
    const frontLight = new THREE.PointLight(0xffdca0, 15, 7);
    frontLight.position.set(3, 1.1, 0);
    scene.add(frontLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 64),
      new THREE.MeshBasicMaterial({ color: 0x9a9a91, transparent: true, opacity: 0.13 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.015;
    scene.add(ground);

    const car = new THREE.Group();
    scene.add(car);

    const paint = new THREE.MeshPhysicalMaterial({ color: 0xb9c5c8, metalness: 0.82, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });
    const darkPaint = new THREE.MeshStandardMaterial({ color: 0x10191d, metalness: 0.55, roughness: 0.3 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x172b35, metalness: 0.35, roughness: 0.12, transparent: true, opacity: 0.88, clearcoat: 1 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x080b0d, roughness: 0.86 });
    const alloy = new THREE.MeshStandardMaterial({ color: 0xb9c0bf, metalness: 0.9, roughness: 0.24 });
    const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xfff0c9, emissive: 0xffd88a, emissiveIntensity: lightsOn ? 3.2 : 0.12, metalness: 0.1, roughness: 0.2 });
    const headlights: THREE.MeshStandardMaterial[] = [headlightMaterial];

    const makeBody = (points: [number, number][], depth: number, material: THREE.Material) => {
      const shape = new THREE.Shape();
      points.forEach(([x, y], index) => index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.055, bevelThickness: 0.045, curveSegments: 10 });
      geometry.translate(0, 0, -depth / 2);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      car.add(mesh);
      return mesh;
    };

    makeBody([[-2.15, 0.38], [-2.05, 0.68], [-1.55, 0.83], [-0.92, 1.02], [0.55, 1.02], [1.15, 0.82], [2.12, 0.68], [2.28, 0.48], [2.16, 0.34], [-1.95, 0.34]], 1.28, paint);
    makeBody([[-1.28, 0.94], [-0.72, 1.63], [0.52, 1.63], [1.2, 0.94]], 0.94, glass);

    // Side window frames and trim add readable detail from the showroom camera angle.
    for (const side of [-1, 1]) {
      const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x29414b, metalness: 0.25, roughness: 0.18 });
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.43, 0.018), windowMaterial);
      sideWindow.position.set(-0.05, 1.29, side * 0.482);
      sideWindow.rotation.z = -0.02;
      car.add(sideWindow);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.035, 0.025), alloy);
      trim.position.set(-0.03, 1.045, side * 0.49);
      car.add(trim);
      const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), paint);
      mirror.scale.set(1.25, 0.65, 0.8);
      mirror.position.set(-0.85, 1.0, side * 0.72);
      car.add(mirror);
    }

    // Four road wheels with metallic hubs.
    for (const x of [-1.35, 1.35]) {
      for (const z of [-0.66, 0.66]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.22, 32), rubber);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.43, z);
        wheel.castShadow = true;
        car.add(wheel);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.235, 24), alloy);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(x, 0.43, z * 1.015);
        car.add(hub);
        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.245, 16), darkPaint);
        center.rotation.x = Math.PI / 2;
        center.position.set(x, 0.43, z * 1.02);
        car.add(center);
      }
    }

    // Front grille and two functional light elements.
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.58), darkPaint);
    grille.position.set(2.22, 0.52, 0);
    car.add(grille);
    for (const z of [-0.43, 0.43]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.095, 0.27), headlightMaterial);
      lamp.position.set(2.19, 0.72, z);
      car.add(lamp);
      const lampGlow = new THREE.PointLight(0xffd995, lightsOn ? 2.4 : 0, 1.8);
      lampGlow.position.set(2.35, 0.72, z);
      car.add(lampGlow);
    }
    const rearLightMaterial = new THREE.MeshStandardMaterial({ color: 0x8e1e19, emissive: 0x6c0804, emissiveIntensity: 0.8 });
    const rearLight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.72), rearLightMaterial);
    rearLight.position.set(-2.12, 0.7, 0);
    car.add(rearLight);

    // Low, soft showroom shadow.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.15, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1.25, 0.42, 1);
    shadow.position.y = 0.025;
    scene.add(shadow);

    sceneState.current = { headlights, group: car };

    let frame = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetY = -0.18;
    let targetX = 0.08;

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      targetY += (event.clientX - lastX) * 0.009;
      targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * 0.004, -0.22, 0.35);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const pointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointercancel', pointerUp);
    renderer.domElement.addEventListener('lostpointercapture', pointerUp);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!dragging) {
        car.rotation.y += rotating ? 0.012 : 0;
        car.rotation.y += (targetY - car.rotation.y) * 0.045;
        car.rotation.x += (targetX - car.rotation.x) * 0.045;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', pointerUp);
      renderer.domElement.removeEventListener('lostpointercapture', pointerUp);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      sceneState.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sceneState.current) return;
    sceneState.current.headlights.forEach(material => {
      material.emissiveIntensity = lightsOn ? 3.2 : 0.12;
    });
    sceneState.current.group.traverse(object => {
      if (object instanceof THREE.PointLight && object !== null) object.intensity = lightsOn ? 2.4 : 0;
    });
  }, [lightsOn]);

  useEffect(() => {
    // The animation loop reads this flag through a data attribute on the host.
    hostRef.current?.setAttribute('data-rotating', rotating ? 'true' : 'false');
  }, [rotating]);

  return (
    <div
      ref={hostRef}
      className={`car-3d-canvas ${lightsOn ? 'lights-on' : 'lights-off'} ${rotating ? 'is-rotating' : ''}`}
      role="img"
      aria-label="Interactive 3D silver sports coupe. Drag to rotate the car; use the controls to rotate the view and switch the headlights."
    />
  );
}
