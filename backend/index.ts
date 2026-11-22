import { router, json, db, email, isEmailError, requireAuth, withScopes, requireAdminEmailAllowlist, storage } from '@appdeploy/sdk';

const ADMIN_EMAILS = ['as3703195@gmail.com'];
const admin = () => [requireAuth(), withScopes('email'), requireAdminEmailAllowlist(ADMIN_EMAILS)];
const phoneNumber = '923196982676';

async function photoUrls(items: Array<Record<string, any>>) {
  const paths = items.flatMap(item => Array.isArray(item.photos) ? item.photos : []);
  const signed = paths.length ? await storage.url(paths) : [];
  const urls = new Map(signed.map(item => [item.path, item.url]));
  return items.map(item => ({ ...item, photoUrls: (item.photos || []).map((path: string) => urls.get(path)).filter(Boolean) }));
}

export const handler = router({
  'POST /api/enquiries': [async (ctx) => {
    const body = (ctx.body || {}) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (name.length < 2 || name.length > 80 || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) {
      return json({ error: 'Please enter a valid name and phone number.' }, 400);
    }
    const interest = typeof body.interest === 'string' ? body.interest.slice(0, 80) : 'I have a question';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
    const createdAt = new Date().toISOString();
    const [id] = await db.add('enquiries', [{ name, phone, interest, message, status: 'new', createdAt, source: 'Sherazi Motors website' }]);
    if (!id) return json({ error: 'Your enquiry could not be saved.' }, 500);
    let emailNotified = false;
    try {
      const result = await email.notifyOwner({
        subject: 'New Sherazi Motors website enquiry',
        heading: 'A new customer enquiry has been saved',
        rows: [{ label: 'Enquiry ID', value: id }, { label: 'Name', value: name }, { label: 'Phone', value: phone }, { label: 'Interested in', value: interest }, { label: 'Details', value: message || 'Not provided' }, { label: 'Received at', value: createdAt }],
        idempotencyKey: 'enquiry:' + id,
      });
      emailNotified = result.status === 'accepted' || result.status === 'sent';
    } catch (err) {
      console.warn('Owner email alert skipped', isEmailError(err) ? err.code : err);
    }
    const whatsappText = ['Hello Sherazi Motors, I submitted an enquiry.', 'Name: ' + name, 'Phone: ' + phone, 'Interest: ' + interest, 'Details: ' + (message || 'Not provided'), 'Reference: ' + id].join('\n');
    return json({ ok: true, enquiryId: id, emailNotified, whatsappUrl: 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(whatsappText) });
  }],
  'GET /api/vehicles': [async () => {
    const result = await db.list('vehicles', { limit: 100 });
    return json({ vehicles: await photoUrls(result.items.filter(item => item.status === 'available')) });
  }],
  'GET /api/admin/vehicles': [...admin(), async () => {
    const result = await db.list('vehicles', { limit: 100 });
    return json({ vehicles: await photoUrls(result.items) });
  }],
  'POST /api/admin/vehicles': [...admin(), async (ctx) => {
    const body = (ctx.body || {}) as Record<string, any>;
    const make = typeof body.make === 'string' ? body.make.trim().slice(0, 60) : '';
    const model = typeof body.model === 'string' ? body.model.trim().slice(0, 80) : '';
    const year = Number(body.year), mileage = Number(body.mileage), price = Number(body.price);
    if (!make || !model || !Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1 || !Number.isFinite(mileage) || mileage < 0 || !Number.isFinite(price) || price < 0) {
      return json({ error: 'Enter a valid make, model, year, mileage and price.' }, 400);
    }
    const files = Array.isArray(body.photos) ? body.photos.slice(0, 5) : [];
    const id = crypto.randomUUID();
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const match = typeof files[i] === 'string' ? files[i].match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/) : null;
      if (!match || files[i].length > 3000000) return json({ error: 'Please use JPG, PNG or WebP photos under 2 MB each.' }, 400);
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const path = 'vehicles/' + id + '/' + i + '.' + ext;
      const [ok] = await storage.write([{ path, content: match[2], contentType: 'image/' + match[1] }]);
      if (!ok) {
        if (paths.length) await storage.delete(paths);
        return json({ error: 'A photo could not be uploaded.' }, 500);
      }
      paths.push(path);
    }
    const createdAt = new Date().toISOString();
    const [created] = await db.tx.add('vehicles', [{ id, make, model, year, mileage, price, transmission: String(body.transmission || '—').slice(0, 40), fuel: String(body.fuel || '—').slice(0, 40), description: String(body.description || '').slice(0, 1500), status: body.status === 'sold' ? 'sold' : 'available', photos: paths, createdAt, updatedAt: createdAt }]);
    if (!created) {
      if (paths.length) await storage.delete(paths);
      return json({ error: 'Vehicle could not be saved.' }, 500);
    }
    return json({ ok: true, id: created });
  }],
  'PUT /api/admin/vehicles/:id': [...admin(), async (ctx) => {
    const body = (ctx.body || {}) as Record<string, any>;
    const [current] = await db.get<Record<string, any>>('vehicles', [ctx.params.id], { consistent: true });
    if (!current) return json({ error: 'Vehicle not found.' }, 404);
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['make', 'model', 'transmission', 'fuel', 'description']) {
      if (body[key] !== undefined) patch[key] = String(body[key]).trim().slice(0, key === 'description' ? 1500 : 80);
    }
    for (const key of ['year', 'mileage', 'price']) {
      if (body[key] !== undefined) {
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value < 0 || (key === 'year' && (!Number.isInteger(value) || value < 1980 || value > new Date().getFullYear() + 1))) return json({ error: 'Invalid ' + key + ' value.' }, 400);
        patch[key] = value;
      }
    }
    if (body.status !== undefined) {
      if (body.status !== 'available' && body.status !== 'sold') return json({ error: 'Invalid status.' }, 400);
      patch.status = body.status;
    }
    if (body.photos !== undefined) {
      if (!Array.isArray(body.photos) || body.photos.length > 5) return json({ error: 'Choose up to five photos.' }, 400);
      const paths: string[] = [];
      for (let i = 0; i < body.photos.length; i++) {
        const match = typeof body.photos[i] === 'string' ? body.photos[i].match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/) : null;
        if (!match || body.photos[i].length > 3000000) {
          if (paths.length) await storage.delete(paths);
          return json({ error: 'Invalid photo. Use JPG, PNG or WebP under 2 MB each.' }, 400);
        }
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const path = 'vehicles/' + ctx.params.id + '-update-' + Date.now() + '-' + i + '.' + ext;
        const [ok] = await storage.write([{ path, content: match[2], contentType: 'image/' + match[1] }]);
        if (!ok) {
          if (paths.length) await storage.delete(paths);
          return json({ error: 'A photo could not be uploaded.' }, 500);
        }
        paths.push(path);
      }
      patch.photos = paths;
    }
    const [ok] = await db.update('vehicles', [{ id: ctx.params.id, record: { ...current, ...patch } }]);
    if (!ok) return json({ error: 'Vehicle could not be updated.' }, 500);
    if (body.photos !== undefined && Array.isArray(current.photos) && current.photos.length) await storage.delete(current.photos);
    return json({ ok: true });
  }],
  'DELETE /api/admin/vehicles/:id': [...admin(), async (ctx) => {
    const [current] = await db.get<Record<string, any>>('vehicles', [ctx.params.id], { consistent: true });
    if (!current) return json({ error: 'Vehicle not found.' }, 404);
    const [ok] = await db.delete('vehicles', [ctx.params.id]);
    if (!ok) return json({ error: 'Vehicle could not be deleted.' }, 500);
    if (Array.isArray(current.photos) && current.photos.length) await storage.delete(current.photos);
    return json({ ok: true });
  }],
});
