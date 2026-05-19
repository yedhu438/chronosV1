'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Toast } from '@/components/Toast';
import { ChronosEvent, Subscriber, NotifLog, CATS } from '@/types';

type AdminTab = 'events' | 'add' | 'subs' | 'log' | 'settings';

const EMPTY_FORM = { name: '', date: '', time: '09:00', category: 'launch', desc: '', emailNotif: true, waNotif: true };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>('events');
  const [events, setEvents] = useState<ChronosEvent[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<NotifLog[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [sf, setSf] = useState({ name: '', email: '', phone: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [sending, setSending] = useState<number | null>(null);
  const [calendarEditEnabled, setCalendarEditEnabled] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (session) {
      fetch('/api/events').then(r => r.json()).then((evs: ChronosEvent[]) => {
        setEvents(evs);
        // If redirected from calendar with ?edit=<id>, open that event
        const editParam = searchParams.get('edit');
        if (editParam) {
          const ev = evs.find(e => e.id === Number(editParam));
          if (ev) {
            setEditId(ev.id);
            setForm({ name: ev.name, date: ev.date, time: ev.time, category: ev.category, desc: ev.desc, emailNotif: ev.emailNotif, waNotif: ev.waNotif });
            setTab('add');
            router.replace('/admin');
          }
        }
      });
      fetch('/api/subscribers').then(r => r.json()).then(setSubs);
      fetch('/api/notifications/log').then(r => r.json()).then(setLogs);
      fetch('/api/settings').then(r => r.json()).then(d => setCalendarEditEnabled(d.calendarEditEnabled));
    }
  }, [session, searchParams, router]);

  async function toggleCalendarEdit(val: boolean) {
    setSettingsSaving(true);
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarEditEnabled: val }) });
    setCalendarEditEnabled(val);
    setSettingsSaving(false);
    showToast(`Calendar editing ${val ? 'enabled' : 'disabled'}`, 'success');
  }

  async function handleLogin() {
    setLoginLoading(true);
    const res = await signIn('credentials', { username: loginUser, password: loginPass, redirect: false });
    setLoginLoading(false);
    if (res?.error) setLoginErr(true);
    else setLoginErr(false);
  }

  async function saveEvent() {
    if (!form.name || !form.date) return;
    if (editId) {
      await fetch(`/api/events/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...form, category: form.category as ChronosEvent['category'], id: editId } : e));
      showToast('Event updated', 'success');
    } else {
      const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const created = await res.json();
      setEvents(prev => [...prev, created]);
      showToast('Event added', 'success');
    }
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setTab('events');
  }

  async function deleteEvent(id: number) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Event deleted');
  }

  function startEdit(ev: ChronosEvent) {
    setEditId(ev.id);
    setForm({ name: ev.name, date: ev.date, time: ev.time, category: ev.category, desc: ev.desc, emailNotif: ev.emailNotif, waNotif: ev.waNotif });
    setTab('add');
  }

  async function addSub() {
    if (!sf.name || !sf.email) return;
    await fetch('/api/subscribers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sf) });
    const res = await fetch('/api/subscribers');
    setSubs(await res.json());
    setSf({ name: '', email: '', phone: '' });
    showToast(`${sf.name} added`, 'success');
  }

  async function removeSub(id: number) {
    await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    setSubs(prev => prev.filter(s => s.id !== id));
    showToast('Removed');
  }

  async function sendNotifications(eventId: number) {
    setSending(eventId);
    try {
      const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast(`Sent: ${data.email} email(s)${data.lark ? ', Lark notified' : ''}`, 'success');
      const logRes = await fetch('/api/notifications/log');
      setLogs(await logRes.json());
    } catch {
      showToast('Some notifications failed — check log', 'error');
    } finally {
      setSending(null);
    }
  }

  const now = new Date();
  const thisMonth = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // ── Login screen ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Loading...</div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="ch-login-overlay" style={{ position: 'fixed' }}>
          <div className="ch-login-box">
            <div className="ch-login-title">Sign In</div>
            <div className="ch-login-sub">Admin access required</div>
            {loginErr && <div className="ch-login-err">Invalid credentials — check username and password</div>}
            <div className="ch-form-group">
              <label className="ch-form-label">Username</label>
              <input className="ch-form-input" value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginErr(false); }} placeholder="admin" />
            </div>
            <div className="ch-form-group">
              <label className="ch-form-label">Password</label>
              <input className="ch-form-input" type="password" value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginErr(false); }} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="ch-btn-primary" style={{ flex: 1 }} onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Enter →'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Admin panel ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="ch-section" style={{ paddingTop: '10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
          <div>
            <div className="ch-section-eyebrow">Control centre</div>
            <div className="ch-section-title">Admin<br /><em>Panel</em></div>
          </div>
        </div>

        {/* Metrics */}
        <div className="ch-metrics">
          {[['Events', events.length, true], ['Subscribers', subs.length, false], ['Notifications', logs.length, false], ['This Month', thisMonth, false]].map(([l, v, g]) => (
            <div key={String(l)} className={`ch-metric-box${g ? ' gold' : ''}`}>
              <div className="ch-metric-n">{v}</div>
              <div className="ch-metric-l">{l}</div>
            </div>
          ))}
        </div>

        <div className="ch-admin-layout">
          {/* Sidebar */}
          <div className="ch-admin-side">
            <div className="ch-side-user">
              <div className="ch-side-avatar">A</div>
              <div>
                <div className="ch-side-name">Admin</div>
                <div className="ch-side-role">Super Admin</div>
              </div>
            </div>
            {([['events', '01  Events'], ['add', '02  Add Event'], ['subs', '03  Employees'], ['log', '04  Notif Log'], ['settings', '05  Settings']] as [AdminTab, string][]).map(([t, l]) => (
              <button
                key={t}
                className={`ch-side-link${tab === t ? ' active' : ''}`}
                onClick={() => {
                  if (t === 'add') { setEditId(null); setForm({ ...EMPTY_FORM }); }
                  setTab(t);
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="ch-admin-main">

            {/* ── Events table ── */}
            {tab === 'events' && (
              <>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: 24 }}>Manage Events</div>
                <table className="ch-admin-table">
                  <thead>
                    <tr>{['Event', 'Date', 'Category', 'Notif', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id}>
                        <td style={{ color: '#e8e0d0', fontWeight: 500 }}>{ev.name}</td>
                        <td style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'rgba(200,151,58,0.7)' }}>{ev.date}</td>
                        <td>
                          <span className="ch-cat-pill" style={{ color: CATS[ev.category]?.c, border: `1px solid ${CATS[ev.category]?.c}44`, background: `${CATS[ev.category]?.c}10` }}>
                            {ev.category}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{ev.emailNotif ? '✉ ' : ''}{ev.waNotif ? '🐦 Lark' : ''}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="ch-btn-ghost ch-btn-sm" onClick={() => startEdit(ev)}>Edit</button>
                            <button
                              className="ch-btn-success ch-btn-sm"
                              onClick={() => sendNotifications(ev.id)}
                              disabled={sending === ev.id}
                              style={{ opacity: sending === ev.id ? 0.5 : 1 }}
                            >
                              {sending === ev.id ? '...' : '🔔 Notify'}
                            </button>
                            <button className="ch-btn-danger ch-btn-sm" onClick={() => deleteEvent(ev.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* ── Add/Edit event ── */}
            {tab === 'add' && (
              <>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: 24 }}>
                  {editId ? 'Edit Event' : 'New Event'}
                </div>
                <div className="ch-form-row">
                  <div className="ch-form-group">
                    <label className="ch-form-label">Event Name</label>
                    <input className="ch-form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Product Launch" />
                  </div>
                  <div className="ch-form-group">
                    <label className="ch-form-label">Category</label>
                    <select className="ch-form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#0a0a0a', cursor: 'pointer' }}>
                      {Object.entries(CATS).map(([v, c]) => <option key={v} value={v}>{c.l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ch-form-row">
                  <div className="ch-form-group">
                    <label className="ch-form-label">Date</label>
                    <input className="ch-form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="ch-form-group">
                    <label className="ch-form-label">Time</label>
                    <input className="ch-form-input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Description</label>
                  <textarea className="ch-form-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: 'vertical', minHeight: 80 }} placeholder="Event description..." />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Notifications</label>
                  <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                    <label style={{ fontSize: 11, color: 'rgba(232,224,208,0.5)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Space Mono,monospace', letterSpacing: 1 }}>
                      <input type="checkbox" checked={form.emailNotif} onChange={e => setForm(f => ({ ...f, emailNotif: e.target.checked }))} style={{ accentColor: '#c8973a' }} /> Email
                    </label>
                    <label style={{ fontSize: 11, color: 'rgba(232,224,208,0.5)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Space Mono,monospace', letterSpacing: 1 }}>
                      <input type="checkbox" checked={form.waNotif} onChange={e => setForm(f => ({ ...f, waNotif: e.target.checked }))} style={{ accentColor: '#c8973a' }} /> Lark
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="ch-btn-primary" onClick={saveEvent}>Save Event →</button>
                  <button className="ch-btn-ghost" onClick={() => setTab('events')}>Cancel</button>
                </div>
              </>
            )}

            {/* ── Subscribers ── */}
            {tab === 'subs' && (
              <>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: 24 }}>Employees</div>
                <div style={{ background: 'rgba(200,151,58,0.04)', border: '1px solid rgba(200,151,58,0.1)', padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(200,151,58,0.5)', textTransform: 'uppercase', fontFamily: 'Space Mono,monospace', marginBottom: 16 }}>Add Subscriber</div>
                  <div className="ch-form-row" style={{ marginBottom: 12 }}>
                    <input className="ch-form-input" placeholder="Full Name" value={sf.name} onChange={e => setSf(f => ({ ...f, name: e.target.value }))} />
                    <input className="ch-form-input" type="email" placeholder="Email" value={sf.email} onChange={e => setSf(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <input className="ch-form-input" placeholder="Phone (with country code)" value={sf.phone} onChange={e => setSf(f => ({ ...f, phone: e.target.value }))} style={{ flex: 1 }} />
                    <button className="ch-btn-primary" onClick={addSub}>Add →</button>
                  </div>
                </div>
                {subs.map(s => (
                  <div key={s.id} className="ch-sub-row">
                    <div className="ch-sub-init">{s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#e8e0d0', fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono,monospace', marginTop: 2 }}>{s.email} · {s.phone}</div>
                    </div>
                    <button className="ch-btn-danger ch-btn-sm" onClick={() => removeSub(s.id)}>Remove</button>
                  </div>
                ))}
                {subs.length === 0 && <div style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Playfair Display,serif', fontSize: 14, fontStyle: 'italic', marginTop: 20 }}>No subscribers yet.</div>}
              </>
            )}

            {/* ── Notification log ── */}
            {tab === 'log' && (
              <>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: 24 }}>Notification Log</div>
                {logs.map((l, i) => (
                  <div key={i} className="ch-log-row">
                    <div className="ch-log-ch" style={{ color: l.channel === 'email' ? 'rgba(200,151,58,0.7)' : 'rgba(100,200,150,0.7)' }}>
                      {l.channel === 'email' ? '✉' : '💬'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#e8e0d0' }}>{l.subscriberName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono,monospace', marginTop: 2 }}>{l.eventName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'Space Mono,monospace' }}>{l.sentAt}</div>
                      <div style={{
                        fontSize: 9, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Space Mono,monospace',
                        color: l.status === 'delivered' ? 'rgba(100,200,100,0.6)' : 'rgba(200,100,100,0.6)'
                      }}>{l.status}</div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <div style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Playfair Display,serif', fontSize: 14, fontStyle: 'italic' }}>No notifications sent yet.</div>}
              </>
            )}

            {/* ── Settings ── */}
            {tab === 'settings' && (
              <>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: 24 }}>Settings</div>
                <div style={{ background: 'rgba(200,151,58,0.04)', border: '1px solid rgba(200,151,58,0.1)', padding: 28, maxWidth: 480 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(200,151,58,0.5)', textTransform: 'uppercase', fontFamily: 'Space Mono,monospace', marginBottom: 20 }}>Calendar Access</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#e8e0d0', fontWeight: 500, marginBottom: 6 }}>Calendar Edit Mode</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,224,208,0.35)', lineHeight: 1.5, fontFamily: 'Space Mono,monospace' }}>
                        When enabled, an Edit button appears on events in the calendar so you can edit them directly.
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCalendarEdit(!calendarEditEnabled)}
                      disabled={settingsSaving}
                      style={{
                        flexShrink: 0,
                        width: 52, height: 28,
                        borderRadius: 14,
                        border: 'none',
                        background: calendarEditEnabled ? '#c8973a' : 'rgba(255,255,255,0.1)',
                        cursor: settingsSaving ? 'not-allowed' : 'pointer',
                        opacity: settingsSaving ? 0.5 : 1,
                        transition: 'background 0.2s',
                        position: 'relative',
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: 4, left: calendarEditEnabled ? 28 : 4,
                        width: 20, height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 10, fontFamily: 'Space Mono,monospace', letterSpacing: 2, color: calendarEditEnabled ? 'rgba(100,200,100,0.6)' : 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
                    {calendarEditEnabled ? 'Editing enabled' : 'View only'}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </>
  );
}
