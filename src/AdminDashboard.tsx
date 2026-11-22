import { useEffect, useState } from 'react';
import { api, auth } from '@appdeploy/client';
import { ArrowLeft, CarFront, Check, ImagePlus, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import './admin.css';

const OWNER = 'as3703195@gmail.com';
type Vehicle = { id: string; make: string; model: string; year: number; mileage: number; price: number; transmission?: string; fuel?: string; description?: string; status: 'available' | 'sold'; photoUrls?: string[] };
const blank = { make: '', model: '', year: String(new Date().getFullYear()), mileage: '', price: '', transmission: 'Automatic', fuel: 'Petrol', description: '', status: 'available' };

async function shrink(file: File) {
  const image = await createImageBitmap(file);
  const ratio = Math.min(1, 1400 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare this photo.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function AdminDashboard() {
  const [user, setUser] = useState('');
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(blank);
  const [photos, setPhotos] = useState<string[]>([]);
  const [editId, setEditId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let live = true;
    auth.getUser().then(account => { if (live) setUser(account?.email || ''); })
      .catch(() => { if (live) setMessage('Could not restore sign-in. Refresh and try again.'); })
      .finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, []);

  const load = async () => {
    try {
      const response = await api.get('/api/admin/vehicles');
      setItems(response.data.vehicles || []);
    } catch {
      setMessage('Could not load vehicle listings. Please refresh.');
    }
  };
  useEffect(() => { if (user.toLowerCase() === OWNER) load(); }, [user]);

  const change = (key: string, value: string) => setForm(old => ({ ...old, [key]: value }));
  const reset = () => { setEditId(''); setForm(blank); setPhotos([]); };

  const selectPhotos = async (files: FileList | null) => {
    if (!files) return;
    try {
      setPhotos(await Promise.all(Array.from(files).slice(0, 5).map(shrink)));
      setMessage(files.length > 5 ? 'Only the first five photos were selected.' : '');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Photo preparation failed.');
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    const payload: Record<string, unknown> = { ...form, year: Number(form.year), mileage: Number(form.mileage), price: Number(form.price) };
    if (photos.length) payload.photos = photos;
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
    setPhotos([]);
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

  const logout = async () => { await auth.signOut(); setUser(''); setItems([]); };

  if (checking) return <div className="admin-loading">Checking secure access…</div>;
  if (!user) return <main className="admin-gate"><a href="/" className="admin-back"><ArrowLeft size={16} /> Sherazi Motors</a><section className="admin-login"><div className="admin-icon"><ShieldCheck /></div><small>SHERAZI MOTORS · PRIVATE AREA</small><h1>Welcome back.</h1><p>Sign in with your authorised account to manage vehicle listings.</p><button className="admin-main-button" onClick={() => auth.signInWithRedirect()}>Sign in securely</button>{message && <p>{message}</p>}</section></main>;
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
          <label className="admin-photo-input"><ImagePlus /><span><b>Choose vehicle photos</b><small>Up to five JPG, PNG or WebP images. New photos replace existing photos when editing.</small></span><input type="file" accept="image/*" multiple onChange={e => selectPhotos(e.target.files)} /></label>
          {photos.length > 0 && <div className="admin-previews">{photos.map((photo, i) => <img key={i} src={photo} alt={'Vehicle photo ' + (i+1)} />)}</div>}
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
