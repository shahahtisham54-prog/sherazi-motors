import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import {
  ArrowUpRight,
  Camera,
  CarFront,
  CirclePlay,
  Cuboid,
  Expand,
  X,
} from 'lucide-react';

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  transmission?: string;
  fuel?: string;
  description?: string;
  photoUrls?: string[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PK').format(price);
}

export default function VehicleShowcase() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  useEffect(() => {
    let active = true;
    let started = false;
    let observer: IntersectionObserver | undefined;
    const loadInventory = () => {
      if (started) return;
      started = true;
      if (active) setLoading(true);
      api.get('/api/vehicles')
        .then(response => {
          if (active) setVehicles(response.data.vehicles || []);
        })
        .catch(error => console.error('Inventory could not be loaded', error))
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      loadInventory();
    } else {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer?.disconnect();
          loadInventory();
        }
      }, { rootMargin: '300px 0px' });
      observer.observe(section);
    }

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <section ref={sectionRef} className="vehicle-showcase" id="available-cars">
      <div className="vehicle-showcase-heading">
        <div>
          <div className="eyebrow"><span /> CURRENT INVENTORY</div>
          <h2>Cars available <em>now.</em></h2>
        </div>
        <p>
          Explore the vehicles currently listed by Sherazi Motors. Open a vehicle
          to see its details and media gallery. Contact us to confirm availability.
        </p>
      </div>

      {loading ? (
        <p className="vehicle-empty">Loading current listings…</p>
      ) : vehicles.length === 0 ? (
        <div className="vehicle-empty">
          <CarFront size={27} />
          <span>
            Our current listings are being updated. Please contact us for
            available vehicles.
          </span>
        </div>
      ) : (
        <div className="vehicle-public-grid">
          {vehicles.map(car => (
            <button
              className="vehicle-public-card"
              key={car.id}
              type="button"
              onClick={() => setSelected(car)}
              aria-label={'View details for ' + car.year + ' ' + car.make + ' ' + car.model}
            >
              <span className="vehicle-card-image">
                {car.photoUrls?.[0] ? (
                  <img src={car.photoUrls[0]} alt={car.make + ' ' + car.model} />
                ) : (
                  <span className="vehicle-public-placeholder"><CarFront size={42} /></span>
                )}
                <span className="vehicle-card-open">VIEW DETAILS <Expand size={13} /></span>
              </span>
              <span className="vehicle-public-info">
                <small>{car.year} · {car.mileage.toLocaleString('en-PK')} km</small>
                <strong className="vehicle-card-title">{car.make} {car.model}</strong>
                <span className="vehicle-card-meta">{[car.transmission, car.fuel].filter(Boolean).join(' · ')}</span>
                <b>PKR {formatPrice(car.price)}</b>
                <span className="vehicle-card-link">Explore this vehicle <ArrowUpRight size={14} /></span>
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="vehicle-detail-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section
            className="vehicle-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-detail-title"
          >
            <button className="vehicle-detail-close" type="button" onClick={() => setSelected(null)} aria-label="Close vehicle details">
              <X size={20} />
            </button>
            <div className="vehicle-detail-kicker">SHERAZI MOTORS · VEHICLE DETAILS</div>
            <h2 id="vehicle-detail-title">{selected.year} {selected.make} {selected.model}</h2>
            <div className="vehicle-detail-layout">
              <div className="vehicle-detail-media">
                {selected.photoUrls?.length ? (
                  <div className="vehicle-detail-gallery">
                    {selected.photoUrls.map((url, index) => (
                      <img key={url} src={url} alt={selected.make + ' ' + selected.model + ' view ' + (index + 1)} />
                    ))}
                  </div>
                ) : (
                  <div className="vehicle-media-empty">
                    <Camera size={34} />
                    <strong>Vehicle photos will appear here</strong>
                    <span>Gallery will be added when the vehicle images are provided.</span>
                  </div>
                )}
                <div className="vehicle-media-slots">
                  <div><CirclePlay size={19} /><span><b>Walkaround video</b><small>Video will be added with the vehicle footage.</small></span></div>
                  <div><Expand size={19} /><span><b>360° exterior & interior</b><small>Interactive view will be enabled when suitable multi-angle media is available.</small></span></div>
                </div>
              </div>
              <aside className="vehicle-detail-side">
                <div className="vehicle-detail-price">PKR {formatPrice(selected.price)}</div>
                <p>{selected.description || 'Contact our team for further information about this vehicle and its condition.'}</p>
                <dl>
                  <div><dt>Year</dt><dd>{selected.year}</dd></div>
                  <div><dt>Mileage</dt><dd>{selected.mileage.toLocaleString('en-PK')} km</dd></div>
                  <div><dt>Transmission</dt><dd>{selected.transmission || 'To be confirmed'}</dd></div>
                  <div><dt>Fuel</dt><dd>{selected.fuel || 'To be confirmed'}</dd></div>
                </dl>
                <div className="vehicle-3d-status">
                  <Cuboid size={20} />
                  <span><b>3D & AR experience</b><small>Prepared for activation after the vehicle's 3D model and supporting media are supplied.</small></span>
                </div>
                <button className="vehicle-feature-disabled" type="button" disabled>3D / AR view — coming with vehicle media</button>
                <a
                  className="vehicle-detail-whatsapp"
                  href={'https://wa.me/923196982676?text=' + encodeURIComponent('Hello Sherazi Motors, I am interested in the ' + selected.year + ' ' + selected.make + ' ' + selected.model + ' listed on your website. Please share more details.')}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enquire about this vehicle <ArrowUpRight size={15} />
                </a>
              </aside>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
