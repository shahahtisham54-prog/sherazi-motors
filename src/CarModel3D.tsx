import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type Props = { lightsOn: boolean; rotating: boolean };

export function CarModel3D({ lightsOn, rotating }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; car: THREE.Group; lights: THREE.Mesh[]; beams: THREE.Mesh[]; spots: THREE.SpotLight[]; streaks: THREE.Mesh[] } | null>(null);

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
    const lamps: THREE.Mesh[] = [];\n    const beams: THREE.Mesh[] = [];\n    const spots: THREE.SpotLight[] = [];\n    const tailLamps: THREE.Mesh[] = [];
    [-.62,.62].forEach(z => {
      const lamp = new THREE.Mesh(new RoundedBoxGeometry(.055,.12,.5,4,.035), new THREE.MeshStandardMaterial({ color: 0xf4fbff, emissive: 0xc9edff, emissiveIntensity: 5.5, toneMapped: false }));
      lamp.position.set(2.14, .99, z); car.add(lamp); lamps.push(lamp);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(.95,.34), new THREE.MeshBasicMaterial({ color: 0xbde9ff, transparent:true, opacity:.22, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide }));
      glow.position.set(2.19,.98,z); glow.rotation.y=Math.PI/2; car.add(glow); beams.push(glow);
      const spot = new THREE.SpotLight(0xd7efff, 0, 13, Math.PI/7, .55, 1.2);
      spot.position.set(2.18,.98,z); spot.target.position.set(7,.35,z*1.4); car.add(spot,spot.target); spots.push(spot);
      const tail = new THREE.Mesh(new RoundedBoxGeometry(.055,.13,.42,4,.035), new THREE.MeshStandardMaterial({ color: 0xff2635, emissive: 0xff071b, emissiveIntensity: 4.2, toneMapped:false }));
      tail.position.set(-2.13,.91,z); car.add(tail); tailLamps.push(tail);
      const tailGlow = new THREE.Mesh(new THREE.PlaneGeometry(.7,.28), new THREE.MeshBasicMaterial({color:0xff1828,transparent:true,opacity:.26,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      tailGlow.position.set(-2.17,.91,z); tailGlow.rotation.y=Math.PI/2; car.add(tailGlow); beams.push(tailGlow);
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
    const streakGroup = new THREE.Group(); scene.add(streakGroup);
    const streaks: THREE.Mesh[] = [];
    for(let i=0;i<30;i++){
      const length=.35+Math.random()*1.15;
      const streak=new THREE.Mesh(new THREE.BoxGeometry(length,.012,.012),new THREE.MeshBasicMaterial({color:i%3===0?0xc5e7f5:0xb99a68,transparent:true,opacity:.18+Math.random()*.28}));
      streak.position.set(-5+Math.random()*10,.45+Math.random()*2.1,(Math.random()-.5)*7);
      streak.userData.speed=.07+Math.random()*.12;
      streakGroup.add(streak); streaks.push(streak);
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.5,48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent:true, opacity:.34 }));
    shadow.rotation.x=-Math.PI/2; shadow.position.y=.025; shadow.scale.set(1,.42,1); car.add(shadow);
    sceneRef.current={scene,camera,renderer,car,lights:[...lamps,...tailLamps],beams,spots,streaks};

    const resize=()=>{ if(!el||disposed)return; const w=el.clientWidth||640; const h=el.clientHeight||360; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const observer=new ResizeObserver(resize); observer.observe(el); resize();
    let frame=0;
    const clock=new THREE.Clock();
    const render=()=>{ if(disposed)return; const dt=Math.min(clock.getDelta(),.04); const data=sceneRef.current; if(data){ data.streaks.forEach(s=>{s.position.x-=s.userData.speed*dt*60;if(s.position.x < -6){s.position.x=6;s.position.y=.45+Math.random()*2.1;s.position.z=(Math.random()-.5)*7;}}); } renderer.render(scene,camera); frame=requestAnimationFrame(render); };
    render();
    return ()=>{ disposed=true; cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose(); const m=o.material; (Array.isArray(m)?m:[m]).forEach(v=>v.dispose());}}); el.removeChild(renderer.domElement); sceneRef.current=null; };
  }, []);

  useEffect(() => {
    const data=sceneRef.current; if(!data)return;
    data.lights.forEach((l,i)=>{ const m=l.material as THREE.MeshStandardMaterial; m.emissiveIntensity=lightsOn?(i<2?7.5:6.5):(i<2?.25:.7); });\n    data.beams.forEach((b,i)=>{(b.material as THREE.MeshBasicMaterial).opacity=lightsOn?(i<2?.48:.34):.035;});\n    data.spots.forEach(s=>{s.intensity=lightsOn?34:0;});
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
