import { useEffect, useState } from 'react';
import { api } from './lib/api';
import { ArrowLeft, CarFront, Check, LogOut, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import './admin.css';

const OWNER = 'as3703195@gmail.com';
type Vehicle = { id: string; make: string; model: string; year: number; mileage: number; price: number; transmission?: string; fuel?: string; description?: string; status: 'available' | 'sold'; photoUrls?: string[] };
const blank = { make: '', model: '', year: String(new Date().getFullYear()), mileage: '', price: '', transmission: 'Automatic', fuel: 'Petrol', description: '', status: 'available' };

export default function AdminDashboard() {
  const [user, setUser] = useState('');
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const response = await api.get('/api/admin/vehicles');
      setItems(response.data.vehicles || []);
    } catch {
      setMessage('Could not load vehicle listings. Please refresh.');
    }
  };

  useEffect(() => {
    let live = true;
    api.get('/api/admin/session')
      .then(response => { if (live) setUser(response.data.user?.email || ''); })
      .catch(() => { if (live) setUser(''); })
      .finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, []);

  useEffect(() => { if (user.toLowerCase() === OWNER) load(); }, [user]);

  const change = (key: string, value: string) => setForm(old => ({ ...old, [key]: value }));
  const reset = () => { setEditId(''); setForm(blank); };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    const payload = { ...form, year: Number(form.year), mileage: Number(form.mileage), price: Number(form.price) };
    try {
      if (editId) await api.put('/api/admin/vehicles/' + editId, payload);
      else await api.post('/api/admin/vehicles', payload);
      await load();
      reset();
      setMessage('Vehicle listing saved.');
    } catch {
      setMessage('Could not save the listing. Please check the details and try again.');
    } finally { setBusy(false); }
  };

  const edit = (item: Vehicle) => {
    setEditId(item.id);
    setForm({ make: item.make, model: item.model, year: String(item.year), mileage: String(item.mileage), price: String(item.price), transmission: item.transmission || 'Automatic', fuel: item.fuel || 'Petrol', description: item.description || '', status: item.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const status = async (item: Vehicle) => {
    const next = item.status === 'sold' ? 'available' : 'sold';
    if (!window.confirm(next === 'sold' ? 'Mark this vehicle as sold?' : 'Make this vehicle available again?')) return;
    try { await api.put('/api/admin/vehicles/' + item.id, { status: next }); await load(); setMessage('Listing status updated.'); }
    catch { setMessage('Could not update listing status.'); }
  };

  const remove = async (item: Vehicle) => {
    if (!window.confirm('Permanently delete ' + item.make + ' ' + item.model + '?')) return;
    try { await api.delete('/api/admin/vehicles/' + item.id); await load(); setMessage('Vehicle listing deleted.'); }
    catch { setMessage('Could not delete this listing.'); }
  };

  const login = () => { window.location.href = '/cdn-cgi/access/login?returnTo=' + encodeURIComponent(window.location.href); };
  const logout = () => { window.location.href = '/cdn-cgi/access/logout?returnTo=' + encodeURIComponent(window.location.origin + '/'); };

  if (checking) return <div className="admin-loading">Checking secure access…</div>;
  if (!user) return <main className="admin-gate"><a href="/" className="admin-back"><ArrowLeft size={16} /> Sherazi Motors</a><section className="admin-login"><div className="admin-icon"><ShieldCheck /></div><small>SHERAZI MOTORS · PRIVATE AREA</small><h1>Welcome back.</h1><p>Sign in with your authorised account to manage vehicle listings.</p><button className="admin-main-button" onClick={login}>Sign in securely</button>{message && <p>{message}</p>}</section></main>;
  if (user.toLowerCase() !== OWNER) return <main className="admin-gate"><section className="admin-login"><h1>Not authorised.</h1><p>This account cannot manage Sherazi Motors listings.</p><button className="admin-main-button" onClick={logout}>Sign out <LogOut size={16} /></button></section></main>;

  return <main className="admin-wrap">
    <header className="admin-top"><a href="/" className="admin-brand"><CarFront /> SHERAZI MOTORS</a><span>{user}</span><button onClick={logout}><LogOut size={15} /> Sign out</button></header>
    <div className="admin-inner">
      <a href="/" className="admin-back"><ArrowLeft size={15} /> View public website</a>
      <div className="admin-title"><div><small>PRIVATE INVENTORY CONTROL</small><h1>Vehicle dashboard</h1><p>Add, edit and manage the cars shown on your website.</p></div><b>{items.length}<small>LISTINGS</small></b></div>
      {message && <div className="admin-message">{message}</div>}
      <section className="admin-box">
        <div className="admin-box-title"><div><small>{editId ? 'EDIT VEHICLE' : 'NEW VEHICLE'}</small><h2>{editId ? 'Update listing' : 'Add a vehicle'}</h2></div>{editId && <button className="admin-cancel" onClick={reset}>Cancel edit</button>}</div>
        <form onSubmit={save}>
          <div className="admin-fields">
            <label>Make<input required maxLength={60} value={form.make} onChange={e => change('make', e.target.value)} placeholder="Toyota" /></label>
            <label>Model<input required maxLength={80} value={form.model} onChange={e => change('model', e.target.value)} placeholder="Corolla Altis" /></label>
            <label>Year<input required type="number" min="1980" max={new Date().getFullYear()+1} value={form.year} onChange={e => change('year', e.target.value)} /></label>
            <label>Mileage (km)<input required type="number" min="0" value={form.mileage} onChange={e => change('mileage', e.target.value)} /></label>
            <label>Price (PKR)<input required type="number" min="0" value={form.price} onChange={e => change('price', e.target.value)} /></label>
            <label>Transmission<select value={form.transmission} onChange={e => change('transmission', e.target.value)}><option>Automatic</option><option>Manual</option><option>CVT</option><option>Other</option></select></label>
            <label>Fuel<select value={form.fuel} onChange={e => change('fuel', e.target.value)}><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option><option>Other</option></select></label>
            <label>Status<select value={form.status} onChange={e => change('status', e.target.value)}><option value="available">Available</option><option value="sold">Sold</option></select></label>
          </div>
          <label className="admin-description">Description<textarea rows={3} maxLength={1500} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Condition, variant, features and other useful details…" /></label>
          <p className="admin-empty">Vehicle photo and video uploads will be added in the next media setup stage.</p>
          <button className="admin-main-button" disabled={busy}>{busy ? 'Saving…' : editId ? 'Save changes' : 'Add vehicle'} <Check size={16} /></button>
        </form>
      </section>
      <section className="admin-box"><div className="admin-box-title"><div><small>YOUR INVENTORY</small><h2>Vehicle listings</h2></div><button className="admin-cancel" onClick={load}>Refresh</button></div>
        {items.length === 0 ? <p className="admin-empty">No vehicles added yet. Add your first listing above.</p> : <div className="admin-grid">{items.map(item => <article className="admin-card" key={item.id}>
          {item.photoUrls?.[0] ? <img src={item.photoUrls[0]} alt={item.make + ' ' + item.model} /> : <div className="admin-no-photo"><CarFront /></div>}
          <div className="admin-card-body"><small className={item.status === 'sold' ? 'sold' : 'available'}>{item.status.toUpperCase()} · {item.year}</small><h3>{item.make} {item.model}</h3><p>{item.mileage.toLocaleString('en-PK')} km · {item.transmission || '—'} · {item.fuel || '—'}</p><b>PKR {item.price.toLocaleString('en-PK')}</b><div className="admin-actions"><button onClick={() => edit(item)}><Pencil size={14} /> Edit</button><button onClick={() => status(item)}>{item.status === 'sold' ? 'Relist' : 'Mark sold'}</button><button onClick={() => remove(item)} aria-label="Delete listing"><Trash2 size={14} /></button></div></div>
        </article>)}</div>}
      </section>
    </div>
  </main>;
}
