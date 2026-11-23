import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Gauge, RotateCw, Sparkles } from 'lucide-react';
import './immersive.css';
import { CarModel3D } from './CarModel3D';

const detailCards = [
  { number: '01', title: 'Sculpted bodywork', copy: 'A closer look at the lines, stance and proportions that define every vehicle.', icon: 'BODY' },
  { number: '02', title: 'Lighting & visibility', copy: 'Explore the details that shape the front profile and everyday driving experience.', icon: 'LIGHT' },
  { number: '03', title: 'Wheels & road presence', copy: 'The finishing details that give a vehicle its character from every angle.', icon: 'WHEELS' },
];

export function HeroCarExperience() {
  const [rotating, setRotating] = useState(false);
  const [lights, setLights] = useState(false);
  const rotateView = () => { if (rotating) return; setRotating(true); window.setTimeout(() => setRotating(false), 1250); };
  return (
    <div className={`hero-car-experience view-0 ${rotating ? 'is-rotating' : ''} ${lights ? 'lights-on' : ''}`}>
      <div className="hero-car-ambient ambient-left" />
      <div className="hero-car-ambient ambient-right" />
      <div className="hero-car-orbit orbit-one" />
      <div className="hero-car-orbit orbit-two" />
      <div className="hero-car-label"><span>DESIGN STUDY / 001</span><b>SHERAZI MOTORS</b></div>
      <div className="hero-car-stage real-car-stage">
        <CarModel3D lightsOn={lights} rotating={rotating} />
      </div>
      <div className="hero-car-controls">
        <button type="button" onClick={rotateView}><RotateCw size={15} /> {rotating ? 'ROTATING...' : 'ROTATE VIEW'}</button>
        <button type="button" onClick={() => setLights(value => !value)}><Sparkles size={15} /> {lights ? 'LIGHTS ON' : 'LIGHTS OFF'}</button>
      </div>
      <div className="hero-car-caption"><Gauge size={15} /><span>INTERACTIVE DESIGN CONCEPT</span><span className="caption-dot" /></div>
    </div>
  );
}

export function DetailStudio() {
  const [selected, setSelected] = useState(0);
  return (
    <section className="detail-studio" id="design-studio">
      <div className="detail-studio-top">
        <div>
          <div className="eyebrow light"><span /> THE DETAILS MAKE THE DRIVE</div>
          <h2>Designed to be<br /><em>seen closer.</em></h2>
        </div>
        <p>Explore the signature details of automotive design through an interactive visual studio. Real vehicle specifications and imagery will be added with each confirmed listing.</p>
      </div>
      <div className="detail-studio-layout">
        <div className={`detail-object detail-object-${selected + 1}`}>
          <div className="detail-object-ring ring-a" />
          <div className="detail-object-ring ring-b" />
          <div className="detail-object-core"><span>{detailCards[selected].icon}</span><b>{detailCards[selected].number}</b></div>
          <div className="detail-object-crosshair" />
          <div className="detail-object-caption">FORM / FUNCTION / FINISH</div>
        </div>
        <div className="detail-studio-list">
          {detailCards.map((card, index) => (
            <button key={card.number} type="button" className={selected === index ? 'detail-choice selected' : 'detail-choice'} onClick={() => setSelected(index)}>
              <span className="detail-choice-number">{card.number}</span>
              <span className="detail-choice-copy"><b>{card.title}</b><small>{card.copy}</small></span>
              <ArrowUpRight size={18} />
            </button>
          ))}
          <a className="detail-studio-link" href="#browse">Explore available vehicles <ArrowDown size={15} /></a>
        </div>
      </div>
    </section>
  );
}
