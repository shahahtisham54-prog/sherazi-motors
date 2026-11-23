import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type Props = { lightsOn: boolean; rotating: boolean };

export function CarModel3D({ lightsOn, rotating }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; car: THREE.Group; lights: THREE.Mesh[] } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(4.5, 2.6, 6.6);
    camera.lookAt(0, 0.72, 0);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xddeeff, 0x17201e, 2.0));
    const key = new THREE.DirectionalLight(0xffe4bd, 3.4);
    key.position.set(3.5, 7, 5); key.castShadow = true; scene.add(key);
    const rim = new THREE.DirectionalLight(0x7cb9d2, 2.5);
    rim.position.set(-5, 3, -4); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(5, 80), new THREE.MeshStandardMaterial({ color: 0x172426, metalness: .35, roughness: .34 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = .015; floor.receiveShadow = true; scene.add(floor);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.7, .012, 8, 100), new THREE.MeshBasicMaterial({ color: 0xb99a68, transparent: true, opacity: .45 }));
    halo.rotation.x = Math.PI / 2; halo.position.y = .025; halo.scale.set(1, .56, 1); scene.add(halo);

    const car = new THREE.Group(); scene.add(car);
    const paint = new THREE.MeshPhysicalMaterial({ color: 0x9aaeb3, metalness: .82, roughness: .2, clearcoat: 1, clearcoatRoughness: .08 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x10191d, metalness: .65, roughness: .28 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x101e29, metalness: .35, roughness: .12, transmission: .12, transparent: true, opacity: .94, clearcoat: 1 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xb9c7c8, metalness: .95, roughness: .16 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x090c0e, roughness: .88 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xc8d0d0, metalness: .95, roughness: .2 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(4.15, .58, 1.78, 6, .18), paint);
    body.position.y = .72; body.castShadow = true; car.add(body);
    const hood = new THREE.Mesh(new RoundedBoxGeometry(1.28, .16, 1.72, 5, .08), paint);
    hood.position.set(1.43, 1.02, 0); hood.castShadow = true; car.add(hood);
    const rear = new THREE.Mesh(new THREE.BoxGeometry(.78, .22, 1.7), paint);
    rear.position.set(-1.62, 1.02, 0); car.add(rear);
    const cabin = new THREE.Mesh(new RoundedBoxGeometry(1.95, .68, 1.43, 6, .15), paint);
    cabin.position.set(-.12, 1.28, 0); cabin.rotation.z = -.04; cabin.castShadow = true; car.add(cabin);
    const roof = new THREE.Mesh(new RoundedBoxGeometry(1.28, .09, 1.38, 5, .045), paint);
    roof.position.set(-.18, 1.66, 0); car.add(roof);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(.12, .53, 1.37), glass);
    windshield.position.set(.91, 1.31, 0); windshield.rotation.z = -.25; car.add(windshield);
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(.12, .48, 1.34), glass);
    rearGlass.position.set(-1.13, 1.3, 0); rearGlass.rotation.z = .25; car.add(rearGlass);
    [-.2,.55].forEach(x => {
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(.66,.39,.025), glass);
      sideWindow.position.set(x,1.37,.73); car.add(sideWindow);
      const other = sideWindow.clone(); other.position.z=-.73; car.add(other);
    });
    const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(.06,.3,1.08), dark);
    frontGrille.position.set(2.105,.67,0); car.add(frontGrille);
    const grilleLine = new THREE.Mesh(new THREE.BoxGeometry(.075,.035,1.13), chrome);
    grilleLine.position.set(2.14,.55,0); car.add(grilleLine);
    const lamps: THREE.Mesh[] = [];
    [-.62,.62].forEach(z => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(.07,.13,.46), new THREE.MeshStandardMaterial({ color: 0xe9f5ff, emissive: 0xc8e8ff, emissiveIntensity: .25 }));
      lamp.position.set(2.12, .98, z); car.add(lamp); lamps.push(lamp);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.38), new THREE.MeshStandardMaterial({ color: 0x8c1018, emissive: 0x9d1018, emissiveIntensity: .4 }));
      tail.position.set(-2.1,.91,z); car.add(tail);
    });
    const wheelGroup = new THREE.Group();
    [-1.28,1.28].forEach(x => [-.91,.91].forEach(z => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.28,40), rubber);
      tire.rotation.x = Math.PI/2; tire.position.set(x,.49,z); tire.castShadow=true; car.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.295,32), rimMat);
      rim.rotation.x = Math.PI/2; rim.position.set(x,.49,z*1.01); car.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.31,24), dark);
      hub.rotation.x = Math.PI/2; hub.position.set(x,.49,z*1.02); car.add(hub);
      for(let i=0;i<10;i++){
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(.035,.48,.035), chrome);
        spoke.position.set(x,.49,z*1.025); spoke.rotation.z=i*Math.PI/5; car.add(spoke);
      }
    }));
    const underGlow = new THREE.PointLight(0x83c5d6, 1.2, 5);
    underGlow.position.set(0,.2,0); car.add(underGlow);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.5,48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent:true, opacity:.34 }));
    shadow.rotation.x=-Math.PI/2; shadow.position.y=.025; shadow.scale.set(1,.42,1); car.add(shadow);
    sceneRef.current={scene,camera,renderer,car,lights:lamps};

    const resize=()=>{ if(!el||disposed)return; const w=el.clientWidth||640; const h=el.clientHeight||360; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const observer=new ResizeObserver(resize); observer.observe(el); resize();
    let frame=0;
    const render=()=>{ if(disposed)return; renderer.render(scene,camera); frame=requestAnimationFrame(render); };
    render();
    return ()=>{ disposed=true; cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose(); const m=o.material; (Array.isArray(m)?m:[m]).forEach(v=>v.dispose());}}); el.removeChild(renderer.domElement); sceneRef.current=null; };
  }, []);

  useEffect(() => {
    const data=sceneRef.current; if(!data)return;
    data.lights.forEach(l=>{ const m=l.material as THREE.MeshStandardMaterial; m.emissiveIntensity=lightsOn?3.2:.25; });
  },[lightsOn]);

  useEffect(() => {
    const data=sceneRef.current; if(!data||!rotating)return;
    const start=data.car.rotation.y; const began=performance.now(); const duration=1300;
    let frame=0;
    const spin=(now:number)=>{ const t=Math.min((now-began)/duration,1); const eased=1-Math.pow(1-t,3); data.car.rotation.y=start+Math.PI*2*eased; if(t<1)frame=requestAnimationFrame(spin); };
    frame=requestAnimationFrame(spin);
    return ()=>cancelAnimationFrame(frame);
  },[rotating]);

  const pointer=useRef<{x:number;y:number;angle:number}|null>(null);
  return <div ref={host} className="car-3d-canvas" role="img" aria-label="Interactive 3D silver sports coupe. Drag to rotate the car." onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY,angle:sceneRef.current?.car.rotation.y||0};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(pointer.current&&sceneRef.current){sceneRef.current.car.rotation.y=pointer.current.angle+(e.clientX-pointer.current.x)*.009;}}} onPointerUp={()=>{pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}} />;
}
