'use client';
import { useState, useEffect } from 'react';
import { Icon, Badge, statusInfo, priorityInfo } from './Icons';
import type { InboxItem } from '@/data/sedeco';

/* ---- Bandeja ---- */
function Bandeja({ inbox, openCaso }: { inbox: InboxItem[]; openCaso: (folio: string) => void }) {
  const [filter, setFilter] = useState('todos');
  const [q, setQ] = useState('');

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'urgente', label: 'Urgentes' },
    { id: 'nuevo', label: 'Nuevos' },
    { id: 'revision', label: 'En revisión' },
    { id: 'pendiente', label: 'Pendientes' }
  ];

  const rows = inbox.filter(r => {
    if (filter === 'urgente' && r.priority !== 'urgente') return false;
    if (['nuevo', 'revision', 'pendiente'].includes(filter) && r.status !== filter) return false;
    if (q.trim()) {
      const low = q.toLowerCase();
      return r.name.toLowerCase().includes(low) || r.folio.toLowerCase().includes(low) || r.type.toLowerCase().includes(low);
    }
    return true;
  });

  const counts = {
    urgente: inbox.filter(r => r.priority === 'urgente').length,
    nuevo: inbox.filter(r => r.status === 'nuevo').length
  };

  return (
    <div className="admin-main">
      <div className="admin-head">
        <h1>Bandeja de entrada</h1>
        <Badge tone="red" dot>{counts.urgente} urgentes</Badge>
        <Badge tone="blue">{counts.nuevo} nuevos</Badge>
        <span style={{ marginLeft: 'auto', fontSize: 13.5, color: 'var(--muted)' }}>{inbox.length} solicitudes activas</span>
      </div>

      <div className="filters">
        {filters.map(f => (
          <button key={f.id} className={'fbtn ' + (filter === f.id ? 'active' : '')} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <span className="grow"></span>
        <span className="search-sm"><Icon name="search" /><input placeholder="Buscar folio o nombre…" value={q} onChange={e => setQ(e.target.value)} /></span>
      </div>

      <div className="inbox">
        {rows.map(r => {
          const si = statusInfo(r.status);
          const pi = priorityInfo(r.priority);
          const late = r.legalUsed >= r.legalDays;
          const remaining = r.legalDays - r.legalUsed;
          return (
            <div className="inbox-row" key={r.folio} onClick={() => openCaso(r.folio)}>
              <span className={'prio ' + r.priority}></span>
              <div className="ib-main">
                <div className="ib-top">
                  <span className="ib-name">{r.name}</span>
                  <Badge tone={pi.tone}>{pi.label}</Badge>
                  <Badge tone={si.tone}>{si.label}</Badge>
                  <span className="ib-type">· {r.type}</span>
                </div>
                <div className="ib-summary">{r.summary}</div>
                <div className="ib-tags">
                  <span className="ib-tag mono">{r.folio}</span>
                  <span className="ib-tag">{r.category}</span>
                  <span className="ib-tag">{r.received}</span>
                </div>
              </div>
              <div className="ib-right">
                <span className={'ib-days ' + (late ? 'late' : '')}>{late ? 'Plazo vencido' : remaining + 'd restantes'}</span>
                <span className="ib-arrow"><Icon name="arrow-right" /></span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--muted)' }}>No hay solicitudes con este filtro.</div>}
      </div>
    </div>
  );
}

/* ---- Caso ---- */
function buildDraft(caso: InboxItem) {
  const today = '5 de junio de 2026';
  if (caso.category === 'Bajo impacto') {
    return `Ciudad de México, a ${today}.\n\nC. ${caso.name}\nP r e s e n t e.\n\nEn atención a su solicitud con folio ${caso.folio}, relativa al ${caso.type.toLowerCase()}, le informamos que, una vez revisada la documentación presentada, esta cumple con los requisitos establecidos.\n\nSu trámite ha sido APROBADO. Puede descargar su comprobante en el portal con su folio.\n\nA t e n t a m e n t e,\nDirección de Establecimientos Mercantiles\nSecretaría de Desarrollo Económico · Gobierno de la Ciudad de México`;
  }
  if (caso.category === 'Alcohol') {
    return `Ciudad de México, a ${today}.\n\nC. ${caso.name}\nP r e s e n t e.\n\nEn atención a su solicitud con folio ${caso.folio}, relativa a la licencia de funcionamiento con venta de bebidas alcohólicas, le informamos que su expediente se encuentra en revisión por tratarse de un giro de impacto vecinal.\n\nPara continuar, se requiere validar el dictamen de Protección Civil y la anuencia vecinal correspondiente.\n\nA t e n t a m e n t e,\nDirección de Giros de Impacto Vecinal\nSecretaría de Desarrollo Económico · Gobierno de la Ciudad de México`;
  }
  if (caso.category === 'Recurso') {
    return `Ciudad de México, a ${today}.\n\n${caso.name}\nP r e s e n t e.\n\nEn atención al recurso de inconformidad con folio ${caso.folio}, se hace de su conocimiento que el mismo ha sido admitido y turnado a la Dirección Jurídica para su dictamen, dentro del plazo legal correspondiente.\n\nA t e n t a m e n t e,\nDirección Jurídica\nSecretaría de Desarrollo Económico · Gobierno de la Ciudad de México`;
  }
  return `Ciudad de México, a ${today}.\n\nC. ${caso.name}\nP r e s e n t e.\n\nEn atención a su solicitud con folio ${caso.folio}, le compartimos la información correspondiente. Quedamos a sus órdenes para cualquier aclaración.\n\nA t e n t a m e n t e,\nSecretaría de Desarrollo Económico · Gobierno de la Ciudad de México`;
}

type AIAnalysis = { resumen: string; accion: string; prioridadTxt: string; riesgos?: string; plazo?: string } | null;

function Caso({ caso, goBack, onResolve }: { caso: InboxItem; goBack: () => void; onResolve: (folio: string, kind: string) => void }) {
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [draftMode, setDraftMode] = useState<'aprobar' | 'info' | 'rechazar' | 'general'>('general');
  const [copied, setCopied] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const d = caso.detail;
  const si = statusInfo(resolved ? 'resuelto' : caso.status);
  const pi = priorityInfo(caso.priority);
  const displayAnalysis = aiAnalysis ?? d;

  async function generate(modo: typeof draftMode = draftMode) {
    setGenerating(true);
    setDraft('');
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso, modo }),
      });
      if (!res.ok || !res.body) throw new Error('Error al generar');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setDraft(text);
      }
    } catch {
      setDraft(buildDraft(caso));
    } finally {
      setGenerating(false);
    }
  }

  async function reanalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caso: {
            folio: caso.folio, name: caso.name, type: caso.type,
            category: caso.category, summary: caso.summary,
            giro: caso.giro, area: caso.area, priority: caso.priority,
            legalDays: caso.legalDays, legalUsed: caso.legalUsed,
            docs: caso.detail.docs,
          }
        }),
      });
      const data = await res.json();
      if (data.analysis) setAiAnalysis(data.analysis);
    } catch { /* keep static */ }
    finally { setAnalyzing(false); }
  }

  function copy() {
    if (navigator.clipboard && draft) navigator.clipboard.writeText(draft).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  const remaining = caso.legalDays - caso.legalUsed;
  const pct = Math.max(0, Math.min(100, (caso.legalUsed / caso.legalDays) * 100));
  const ringColor = remaining <= 1 ? 'var(--error)' : remaining <= 3 ? 'var(--amber)' : 'var(--green)';

  return (
    <div className="admin-main">
      <div className="caso-head">
        <button className="caso-back" onClick={goBack}><Icon name="arrow-left" />Bandeja</button>
        <span className="caso-folio mono">{caso.folio}</span>
        <Badge tone={pi.tone} dot>{pi.label}</Badge>
        <Badge tone={si.tone}>{si.label}</Badge>
      </div>

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.025em' }}>{caso.name}</h1>
        <div style={{ color: 'var(--muted)', fontSize: 14.5, marginTop: 3 }}>{caso.type} · {caso.giro}</div>
      </div>

      <div className="caso-grid">
        <div className="caso-col">
          <div className="card card-pad ia-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="ia-badge"><Icon name="sparkle" style={{ width: 14, height: 14 }} />Análisis de Saptiva KAL</span>
              <button className="btn btn-outline-red btn-sm" style={{ marginLeft: 'auto' }} onClick={reanalyze} disabled={analyzing}>
                <Icon name={analyzing ? 'clock' : 'sparkle'} style={{ width: 13, height: 13 }} />
                {analyzing ? 'Analizando…' : 'Re-analizar'}
              </button>
            </div>
            <div className="ia-sec">
              <div className="ia-h">Resumen del caso</div>
              <p>{displayAnalysis.resumen}</p>
            </div>
            <div className="ia-sec">
              <div className="ia-h">Acción recomendada</div>
              <p>{displayAnalysis.accion}</p>
            </div>
            {aiAnalysis?.riesgos && (
              <div className="ia-sec">
                <div className="ia-h">Puntos de atención</div>
                <p>{aiAnalysis.riesgos}</p>
              </div>
            )}
            <div className="ia-sec">
              <div className="ia-h">Datos extraídos</div>
              <dl className="ia-kv">
                <dt>Folio</dt><dd>{caso.folio}</dd>
                {caso.curp !== '—' && <><dt>CURP</dt><dd>{caso.curp}</dd></>}
                {caso.rfc !== '—' && <><dt>RFC</dt><dd>{caso.rfc}</dd></>}
                <dt>Giro</dt><dd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>{caso.giro}</dd>
                {caso.area !== '—' && <><dt>Superficie</dt><dd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>{caso.area}</dd></>}
              </dl>
            </div>
            <div className="ia-sec">
              <div className="ia-h">Prioridad sugerida</div>
              <p style={{ fontWeight: 600 }}>{displayAnalysis.prioridadTxt}</p>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-label">Documentos del expediente ({d.docs.length})</div>
            {d.docs.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 14 }}>Sin documentos adjuntos (consulta).</div>}
            {d.docs.map((doc, i) => (
              <div className="doc-item" key={i}>
                <span className="di"><Icon name={/\.(png|jpg|jpeg)$/i.test(doc.name) ? 'image' : 'file'} /></span>
                <div style={{ flex: 1 }}>
                  <div className="dn">{doc.name}</div>
                </div>
                {doc.ok
                  ? <Badge tone="green"><Icon name="check" style={{ width: 12, height: 12 }} />Válido</Badge>
                  : <Badge tone="red">Ilegible</Badge>}
              </div>
            ))}
          </div>
        </div>

        <div className="caso-col">
          <div className="card timer-card">
            <div className="timer-ring" style={{ background: `conic-gradient(${ringColor} ${pct}%, var(--border) 0)` }}>
              <span className="tv" style={{ color: ringColor }}>{remaining < 0 ? '0' : remaining}</span>
            </div>
            <div className="timer-txt" style={{ color: ringColor }}>
              {remaining <= 0 ? 'Plazo legal vencido' : `${remaining} día(s) hábil(es) restantes`}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>Plazo legal: {caso.legalDays} días · transcurridos {caso.legalUsed}</div>
          </div>

          <div className="card card-pad draft-card">
            <div className="draft-head">
              <span className="t">Borrador de respuesta</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['general', 'aprobar', 'info', 'rechazar'] as const).map(m => (
                  <button key={m} className={'btn btn-sm ' + (draftMode === m ? 'btn-primary' : 'btn-secondary')}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => { setDraftMode(m); generate(m); }}>
                    {m === 'general' ? 'Seguimiento' : m === 'aprobar' ? 'Aprobar' : m === 'info' ? 'Pedir info' : 'Rechazar'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea className={'draft-area' + (generating ? ' flash' : '')}
                placeholder={'Selecciona un tipo de respuesta arriba para generar el borrador con IA…'}
                value={draft} onChange={e => setDraft(e.target.value)} />
              {generating && (
                <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="mini-spin"></span>Generando…
                </div>
              )}
            </div>
            <div className="draft-actions">
              <button className="btn btn-secondary btn-sm" onClick={copy} disabled={!draft}><Icon name={copied ? 'check' : 'copy'} style={{ width: 14, height: 14 }} />{copied ? 'Copiado' : 'Copiar'}</button>
              <button className="btn btn-secondary btn-sm"><Icon name="reassign" style={{ width: 14, height: 14 }} />Reasignar</button>
            </div>
          </div>

          {!resolved ? (
            <div className="card card-pad">
              <div className="section-label">Resolución</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary btn-block" onClick={() => { setResolved(true); onResolve(caso.folio, 'aprobado'); setDraftMode('aprobar'); generate('aprobar'); }}><Icon name="check" />Aprobar y notificar</button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setResolved(true); onResolve(caso.folio, 'info'); setDraftMode('info'); generate('info'); }}><Icon name="mail" style={{ width: 15, height: 15 }} />Pedir info</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setResolved(true); onResolve(caso.folio, 'rechazado'); setDraftMode('rechazar'); generate('rechazar'); }}><Icon name="x" style={{ width: 15, height: 15 }} />Rechazar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card card-pad" style={{ textAlign: 'center', borderColor: 'var(--green-bd)', background: 'var(--green-bg)' }}>
              <div style={{ color: 'var(--green)', display: 'inline-grid', placeItems: 'center', width: 46, height: 46, borderRadius: '50%', background: '#fff', border: '1px solid var(--green-bd)', margin: '0 auto 10px' }}>
                <Icon name="check" style={{ width: 24, height: 24 }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Caso resuelto</div>
              <div style={{ fontSize: 13.5, color: '#15803D', marginTop: 3 }}>El ciudadano fue notificado por correo automáticamente.</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={goBack}>Volver a la bandeja</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Dashboard ---- */
function Dashboard({ inbox }: { inbox: InboxItem[] }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 120); return () => clearTimeout(t); }, []);

  const kpis = [
    { v: '1,284', l: 'Solicitudes este mes', d: '+12% vs. mayo', tone: 'up' },
    { v: '3.2h', l: 'Tiempo medio de respuesta', d: '−68% con IA', tone: 'down' },
    { v: '94%', l: 'Clasificadas automáticamente', d: 'por Saptiva KAL', tone: 'up' },
    { v: '7', l: 'Casos en riesgo de plazo', d: 'requieren atención', tone: 'warn' }
  ];
  const byType = [
    { l: 'Aviso de funcionamiento', v: 38 },
    { l: 'Licencia c/ alcohol', v: 22 },
    { l: 'Apoyo FONDESO', v: 16 },
    { l: 'Transparencia', v: 12 },
    { l: 'Consultas', v: 12 }
  ];
  const week = [
    { d: 'Lun', recibidas: 210, resueltas: 198 },
    { d: 'Mar', recibidas: 245, resueltas: 232 },
    { d: 'Mié', recibidas: 198, resueltas: 205 },
    { d: 'Jue', recibidas: 268, resueltas: 240 },
    { d: 'Vie', recibidas: 222, resueltas: 230 }
  ];
  const maxWeek = 300;
  const risk = inbox.filter(r => (r.legalDays - r.legalUsed) <= 2)
    .sort((a, b) => (a.legalDays - a.legalUsed) - (b.legalDays - b.legalUsed)).slice(0, 5);

  return (
    <div className="admin-main">
      <div className="admin-head">
        <h1>Panel de control</h1>
        <span style={{ marginLeft: 'auto', fontSize: 13.5, color: 'var(--muted)' }}>Actualizado hoy, 9:42am</span>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="card kpi" key={i}>
            <div className="kv">{k.v}</div>
            <div className="kl">{k.l}</div>
            <div className={'kd ' + k.tone}>{k.tone === 'warn' ? <Icon name="alert" style={{ width: 13, height: 13 }} /> : <Icon name="check" style={{ width: 13, height: 13 }} />}{k.d}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <div className="chart-title">Solicitudes por tipo de trámite</div>
          {byType.map((b, i) => (
            <div className="barrow" key={i}>
              <span className="bl">{b.l}</span>
              <span className="bt"><span className="bf" style={{ width: anim ? b.v + '%' : 0 }}></span></span>
              <span className="bv">{b.v}%</span>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <div className="chart-title">Recibidas vs. resueltas — esta semana</div>
          <div className="legend"><span><i style={{ background: 'var(--red)' }}></i>Recibidas</span><span><i style={{ background: 'var(--amber)' }}></i>Resueltas</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, paddingTop: 10 }}>
            {week.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 150 }}>
                  <div style={{ width: 14, background: 'var(--red)', borderRadius: '4px 4px 0 0', height: anim ? (w.recibidas / maxWeek * 150) : 0, transition: `height .9s var(--ease) ${i * 0.06}s` }}></div>
                  <div style={{ width: 14, background: 'var(--amber)', borderRadius: '4px 4px 0 0', height: anim ? (w.resueltas / maxWeek * 150) : 0, transition: `height .9s var(--ease) ${i * 0.06 + 0.1}s` }}></div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{w.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="alert" style={{ width: 17, height: 17, color: 'var(--error)' }} />Casos en riesgo de incumplir plazo legal</div>
        <table className="risk">
          <thead><tr><th>Folio</th><th>Solicitante</th><th>Tipo</th><th>Días restantes</th><th>Prioridad</th></tr></thead>
          <tbody>
            {risk.map(r => {
              const rem = r.legalDays - r.legalUsed;
              return (
                <tr key={r.folio} className={rem <= 0 ? 'over' : ''}>
                  <td className="fol mono">{r.folio}</td>
                  <td>{r.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.type}</td>
                  <td className={'dd ' + (rem <= 1 ? 'bad' : '')}>{rem <= 0 ? 'Vencido' : rem + 'd'}</td>
                  <td><Badge tone={priorityInfo(r.priority).tone}>{priorityInfo(r.priority).label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- AdminPanel shell ---- */
export function AdminPanel({ inbox, resolveCaso }: { inbox: InboxItem[]; resolveCaso: (folio: string, kind: string) => void }) {
  const [view, setView] = useState('bandeja');
  const [casoFolio, setCasoFolio] = useState<string | null>(null);

  const caso = inbox.find(r => r.folio === casoFolio);
  const newCount = inbox.filter(r => r.status === 'nuevo').length;

  const nav = [
    { id: 'bandeja', label: 'Bandeja', icon: 'inbox', count: newCount },
    { id: 'casos', label: 'Mis casos', icon: 'folder', count: 0 },
    { id: 'dashboard', label: 'Panel', icon: 'chart', count: 0 },
    { id: 'config', label: 'Ajustes', icon: 'settings', count: 0 }
  ];

  function openCaso(folio: string) { setCasoFolio(folio); setView('caso'); }

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sb-brand"><span className="m">S</span>Secretar<b>IA</b></div>
        <nav className="sb-nav">
          {nav.map(n => {
            const active = view === n.id || (n.id === 'bandeja' && view === 'caso');
            return (
              <button key={n.id} className={'sb-item ' + (active ? 'active' : '')} onClick={() => { setView(n.id); setCasoFolio(null); }}>
                <Icon name={n.icon} /><span className="lbl">{n.label}</span>
                {n.count > 0 && <span className="count">{n.count}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sb-foot">
          <span className="av">LM</span>
          <div><div className="nm">Lic. Laura Méndez</div><div className="rl">Dir. Establecimientos</div></div>
        </div>
      </aside>

      {view === 'bandeja' && <Bandeja inbox={inbox} openCaso={openCaso} />}
      {view === 'caso' && caso && <Caso caso={caso} goBack={() => { setView('bandeja'); setCasoFolio(null); }} onResolve={resolveCaso} />}
      {view === 'casos' && <Bandeja inbox={inbox.filter(r => r.status === 'revision')} openCaso={openCaso} />}
      {view === 'dashboard' && <Dashboard inbox={inbox} />}
      {view === 'config' && (
        <div className="admin-main">
          <div className="admin-head"><h1>Ajustes</h1></div>
          <div className="card card-pad" style={{ color: 'var(--muted)' }}>Configuración de la cuenta, notificaciones y reglas de asignación automática. (Demo)</div>
        </div>
      )}
    </div>
  );
}
