import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = { lightsOn: boolean; rotating: boolean };

export function CarModel3D({ lightsOn, rotating }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    car: THREE.Group;
    lamps: THREE.Mesh[];
    tails: THREE.Mesh[];
    beams: THREE.Mesh[];
    spots: THREE.SpotLight[];
    wheels: THREE.Group[];
    streaks: THREE.Mesh[];
  } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(5.2, 2.45, 7.4);
    camera.lookAt(0, 0.88, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x182023, 2.4));
    const key = new THREE.DirectionalLight(0xffe8ce, 4.5);
    key.position.set(2.5, 7, 5); key.castShadow = true; scene.add(key);
    const rim = new THREE.DirectionalLight(0x8cc8e5, 3.2);
    rim.position.set(-4, 3.2, -5); scene.add(rim);
    const fill = new THREE.PointLight(0xd5e6ef, 2.2, 10);
    fill.position.set(1, 2.5, 4); scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 96),
      new THREE.MeshStandardMaterial({ color: 0x111d20, metalness: .42, roughness: .32 })
    );
    floor.rotation.x = -Math.PI / 2; floor.position.y = .015; floor.receiveShadow = true; scene.add(floor);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.85, .012, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xc6a675, transparent: true, opacity: .55 })
    );
    halo.rotation.x = Math.PI / 2; halo.position.y = .025; halo.scale.set(1, .52, 1); scene.add(halo);

    const car = new THREE.Group(); scene.add(car);
    const paint = new THREE.MeshPhysicalMaterial({
      color: 0x9fb5bf, metalness: .78, roughness: .19, clearcoat: 1, clearcoatRoughness: .07
    });
    const dark = new THREE.MeshStandardMaterial({ color: 0x0b1115, metalness: .68, roughness: .24 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x10202c, metalness: .25, roughness: .1, transparent: true, opacity: .96, clearcoat: 1
    });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd5dedf, metalness: .96, roughness: .15 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x07090b, roughness: .82 });

    // Low, wide sports-coupe silhouette — front of car points along +X.
    const profile = new THREE.Shape();
    profile.moveTo(-2.22, .52);
    profile.quadraticCurveTo(-2.25, .86, -1.86, .91);
    profile.lineTo(-.92, .98);
    profile.quadraticCurveTo(-.58, 1.02, -.28, 1.48);
    profile.quadraticCurveTo(-.08, 1.76, .42, 1.73);
    profile.quadraticCurveTo(.88, 1.69, 1.12, 1.22);
    profile.lineTo(1.88, 1.12);
    profile.quadraticCurveTo(2.18, 1.08, 2.2, .78);
    profile.lineTo(2.08, .52);
    profile.close();
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(profile, {
      depth: 1.82, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .055, bevelThickness: .055
    }), paint);
    body.position.z = -.91; body.castShadow = true; body.receiveShadow = true; car.add(body);

    // Dark panoramic side glass follows the coupe roofline.
    const windowShape = new THREE.Shape();
    windowShape.moveTo(-.78, 1.055);
    windowShape.lineTo(-.24, 1.53);
    windowShape.quadraticCurveTo(-.05, 1.67, .34, 1.65);
    windowShape.quadraticCurveTo(.66, 1.62, .94, 1.18);
    windowShape.lineTo(-.78, 1.055);
    [-.925, .925].forEach(z => {
      const pane = new THREE.Mesh(new THREE.ShapeGeometry(windowShape), glass);
      pane.position.z = z; pane.material.side = THREE.DoubleSide; car.add(pane);
    });
    const roofLine = new THREE.Mesh(new THREE.BoxGeometry(.9, .035, 1.72), chrome);
    roofLine.position.set(.28, 1.71, 0); roofLine.rotation.z = -.05; car.add(roofLine);

    const hoodLine = new THREE.Mesh(new THREE.BoxGeometry(1.15, .018, .012), chrome);
    hoodLine.position.set(1.48, 1.105, .46); car.add(hoodLine);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.75, .11, 1.9), dark);
    sill.position.set(-.02, .48, 0); car.add(sill);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(.055, .24, .88), dark);
    grille.position.set(2.22, .73, 0); car.add(grille);
    const grilleEdge = new THREE.Mesh(new THREE.BoxGeometry(.07, .025, 1.04), chrome);
    grilleEdge.position.set(2.23, .58, 0); car.add(grilleEdge);

    const lamps: THREE.Mesh[] = [];
    const tails: THREE.Mesh[] = [];
    const beams: THREE.Mesh[] = [];
    const spots: THREE.SpotLight[] = [];
    [-.61, .61].forEach(z => {
      const headMaterial = new THREE.MeshBasicMaterial({ color: 0xf4fcff, toneMapped: false });
      const head = new THREE.Mesh(new THREE.BoxGeometry(.045, .105, .48), headMaterial);
      head.position.set(2.235, .98, z); car.add(head); lamps.push(head);

      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(.9, 5.8, 32, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xbdeaff, transparent: true, opacity: .27, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
      );
      beam.rotation.z = -Math.PI / 2;
      beam.position.set(5.0, .91, z);
      car.add(beam); beams.push(beam);

      const spot = new THREE.SpotLight(0xdaf2ff, 150, 15, Math.PI / 7, .5, 1);
      spot.position.set(2.25, .98, z);
      spot.target.position.set(8, .35, z * 1.2);
      car.add(spot, spot.target); spots.push(spot);

      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff182a, toneMapped: false });
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.045, .12, .5), tailMat);
      tail.position.set(-2.24, .89, z); car.add(tail); tails.push(tail);
    });

    const wheels: THREE.Group[] = [];
    [-1.34, 1.32].forEach(x => [-.94, .94].forEach(z => {
      const wheel = new THREE.Group();
      wheel.position.set(x, .49, z); car.add(wheel); wheels.push(wheel);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .25, 48), rubber);
      tire.rotation.x = Math.PI / 2; tire.castShadow = true; wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(.29, .29, .265, 40), chrome);
      rim.rotation.x = Math.PI / 2; wheel.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .28, 24), dark);
      hub.rotation.x = Math.PI / 2; wheel.add(hub);
      for (let i = 0; i < 10; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(.035, .43, .035), chrome);
        spoke.rotation.z = i * Math.PI / 5; wheel.add(spoke);
      }
    }));

    // Moving ground streaks create a speed impression while the showroom car stays inspectable.
    const streaks: THREE.Mesh[] = [];
    for (let i = 0; i < 34; i++) {
      const length = .55 + Math.random() * 1.45;
      const streak = new THREE.Mesh(
        new THREE.BoxGeometry(length, .012, .018),
        new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0xc8e9fa : 0xbda477, transparent: true, opacity: .3 + Math.random() * .28 })
      );
      streak.position.set(-6 + Math.random() * 12, .045, (Math.random() - .5) * 7);
      streak.userData.speed = .12 + Math.random() * .16;
      scene.add(streak); streaks.push(streak);
    }

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .42 })
    );
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .03; shadow.scale.set(1, .38, 1); car.add(shadow);

    sceneRef.current = { renderer, car, lamps, tails, beams, spots, wheels, streaks };
    const resize = () => {
      if (!el || disposed) return;
      const w = el.clientWidth || 640, h = el.clientHeight || 360;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const clock = new THREE.Clock();
    let frame = 0;
    const render = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), .04);
      const data = sceneRef.current;
      if (data) {
        data.streaks.forEach(s => {
          s.position.x -= s.userData.speed * dt * 60;
          if (s.position.x < -7) s.position.x = 7;
        });
        data.wheels.forEach(w => { w.rotation.z -= dt * 10; });
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material;
          (Array.isArray(m) ? m : [m]).forEach(v => v.dispose());
        }
      });
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const data = sceneRef.current;
    if (!data) return;
    data.lamps.forEach(m => ((m.material as THREE.MeshBasicMaterial).color.set(lightsOn ? 0xffffff : 0x71808a)));
    data.tails.forEach(m => ((m.material as THREE.MeshBasicMaterial).color.set(lightsOn ? 0xff001e : 0x68131b)));
    data.beams.forEach(m => ((m.material as THREE.MeshBasicMaterial).opacity = lightsOn ? .34 : 0));
    data.spots.forEach(s => { s.intensity = lightsOn ? 150 : 0; });
  }, [lightsOn]);

  useEffect(() => {
    const data = sceneRef.current;
    if (!data || !rotating) return;
    const start = data.car.rotation.y;
    const began = performance.now();
    const duration = 1400;
    let frame = 0;
    const spin = (now: number) => {
      const t = Math.min((now - began) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      data.car.rotation.y = start + Math.PI * 2 * eased;
      if (t < 1) frame = requestAnimationFrame(spin);
    };
    frame = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(frame);
  }, [rotating]);

  const pointer = useRef<{ x: number; angle: number } | null>(null);
  return (
    <div
      ref={host}
      className="car-3d-canvas"
      role="img"
      aria-label="Interactive 3D low-slung silver sports coupe. Drag to rotate."
      onPointerDown={e => {
        pointer.current = { x: e.clientX, angle: sceneRef.current?.car.rotation.y || 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        if (pointer.current && sceneRef.current) {
          sceneRef.current.car.rotation.y = pointer.current.angle + (e.clientX - pointer.current.x) * .009;
        }
      }}
      onPointerUp={() => { pointer.current = null; }}
      onPointerCancel={() => { pointer.current = null; }}
    />
  );
}
