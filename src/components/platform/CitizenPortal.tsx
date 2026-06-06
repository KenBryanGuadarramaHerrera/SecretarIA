'use client';
import { useState, useRef, useEffect } from 'react';
import { Icon, Badge, statusInfo } from './Icons';
import { CONSULTAS } from '@/data/sedeco';
import type { FolioData } from '@/data/sedeco';

function genFolio() {
  return 'SED-2025-00' + (4840 + Math.floor(Math.random() * 140));
}

const DEMO_FIELDS: Record<string, string> = {
  'Nombre': 'Juan García Pérez',
  'CURP': 'GAPJ850312HDFRCN02',
  'Dirección': 'Av. Insurgentes Sur 1234, Col. Del Valle',
  'Tipo de negocio': 'Cafetería',
  'Superficie': '85 m²'
};

type Detected = { k: string; t: string; sub: string; docs: string[]; costo: string; tiempo: string };

function detectTramite(track: string | null, size: string | null, alcohol: string | null): Detected {
  if (track === 'apoyo') {
    return {
      k: 'Apoyo económico', t: 'FONDESO — Crédito PyME', sub: 'Fondo para el Desarrollo Económico',
      docs: ['Identificación oficial', 'Comprobante de ingresos o estados financieros', 'RFC', 'Plan de negocio'],
      costo: 'Sujeto a evaluación', tiempo: 'Hasta 15 días hábiles'
    };
  }
  if (alcohol === 'Sí') {
    return {
      k: 'Trámite detectado', t: 'Licencia de Funcionamiento', sub: 'Impacto Vecinal · Con venta de alcohol',
      docs: ['Identificación oficial (INE/pasaporte)', 'Comprobante de domicilio del local', 'Dictamen de Protección Civil', 'Anuencia vecinal', 'Opinión de uso de suelo'],
      costo: 'Variable según superficie', tiempo: 'Hasta 10 días hábiles'
    };
  }
  const docs = ['Identificación oficial (INE/pasaporte)', 'Comprobante de domicilio del local', 'CURP', 'Croquis del local'];
  let sub = 'Giro de Bajo Impacto · Sin alcohol';
  let tiempo = 'Respuesta inmediata';
  if (size === 'Más de 250 m²') { docs.push('Dictamen de Protección Civil'); sub = 'Impacto vecinal · Sin alcohol'; tiempo = 'Hasta 5 días hábiles'; }
  return { k: 'Trámite detectado', t: 'Aviso de Funcionamiento', sub, docs, costo: 'Gratuito', tiempo };
}

/* ---- TramiteChat ---- */
type Msg = { from: 'bot' | 'user'; text: string };
type FileItem = { id: string; name: string; status: 'proc' | 'ok' | 'error' };

function TramiteChat({ onSubmitted, goConsulta }: { onSubmitted: (folio: string, tipo: string, goTrack?: boolean) => void; goConsulta: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: 'Hola, soy SecretarIA. ¿Qué quieres hacer hoy? Puedes describirlo con tus palabras o elegir una opción.' }]);
  const [stage, setStage] = useState('start');
  const [track, setTrack] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [alcohol, setAlcohol] = useState<string | null>(null);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [folio, setFolio] = useState<string | null>(null);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, stage, files]);

  function bot(t: string) { setMsgs(m => [...m, { from: 'bot', text: t }]); }
  function user(t: string) { setMsgs(m => [...m, { from: 'user', text: t }]); }

  function pickStart(opt: { id: string; label: string }) {
    user(opt.label);
    setTrack(opt.id);
    setTimeout(() => {
      if (opt.id === 'negocio' || opt.id === 'permiso') {
        bot('Perfecto. Para orientarte mejor, ¿cuántos metros cuadrados tendrá tu negocio aproximadamente?');
        setStage('size');
      } else if (opt.id === 'apoyo') {
        const d = detectTramite('apoyo', null, null);
        bot('Con gusto. Detecté el apoyo que más se ajusta a lo que buscas 👇');
        setDetected(d); setStage('detected');
      } else {
        bot('Para consultas abiertas tengo una herramienta más rápida. ¿Quieres que te lleve a la Consulta rápida?');
        setStage('otro');
      }
    }, 380);
  }
  function pickSize(s: string) {
    user(s); setSize(s);
    setTimeout(() => { bot('¿Tu negocio venderá bebidas alcohólicas?'); setStage('alcohol'); }, 360);
  }
  function pickAlcohol(a: string) {
    user(a); setAlcohol(a);
    setTimeout(() => {
      const d = detectTramite(track, size, a);
      bot('Listo, con base en tus respuestas este es el trámite que necesitas 👇');
      setDetected(d); setStage('detected');
    }, 380);
  }
  function agendar() {
    user('Agendar cita presencial');
    setTimeout(() => { bot('Perfecto. Te muestro los módulos disponibles para agendar tu cita presencial. (Demo)'); setStage('cita'); }, 360);
  }
  async function uploadFile(file: File): Promise<void> {
    const id = `${file.name}-${Date.now()}`;
    setFiles(f => [...f, { id, name: file.name, status: 'proc' }]);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/ocr', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'OCR falló');
      const f = data.fields ?? {};
      setExtractedFields(prev => ({
        ...prev,
        ...(f.nombre && { 'Nombre': f.nombre }),
        ...(f.curp && { 'CURP': f.curp }),
        ...(f.rfc && { 'RFC': f.rfc }),
        ...(f.giro && { 'Tipo de negocio': f.giro }),
        ...(f.superficie && { 'Superficie': f.superficie }),
        ...(f.domicilio && { 'Dirección': f.domicilio }),
      }));
      setFiles(fs => fs.map(x => x.id === id ? { ...x, status: 'ok' } : x));
    } catch {
      setFiles(fs => fs.map(x => x.id === id ? { ...x, status: 'error' as const } : x));
    }
  }

  function simulateDemo() {
    const demos = ['INE_frente.jpg', 'Comprobante_domicilio.pdf', 'CURP.pdf', 'Croquis_local.png'];
    const nf: FileItem[] = demos.map((n, i) => ({ id: `demo-${i}-${Date.now()}`, name: n, status: 'proc' }));
    setFiles(f => [...f, ...nf]);
    setExtractedFields(DEMO_FIELDS);
    nf.forEach((file, i) => {
      setTimeout(() => {
        setFiles(f => f.map(x => x.id === file.id ? { ...x, status: 'ok' } : x));
      }, 900 + i * 500);
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const fs = e.dataTransfer.files;
    if (fs?.length) Array.from(fs).forEach(uploadFile);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) Array.from(e.target.files).forEach(uploadFile);
  }
  const allOk = files.length > 0 && files.every(f => f.status === 'ok' || f.status === 'error');
  function confirmSend() {
    const f = genFolio(); setFolio(f); setStage('success');
    onSubmitted(f, detected?.t ?? 'Trámite');
  }
  function reset() {
    setMsgs([{ from: 'bot', text: 'Hola de nuevo. ¿Qué otro trámite quieres iniciar?' }]);
    setStage('start'); setTrack(null); setSize(null); setAlcohol(null); setDetected(null);
    setFiles([]); setFolio(null); setExtractedFields({});
  }
  function sendText() {
    if (!text.trim()) return;
    user(text.trim());
    const low = text.toLowerCase(); setText('');
    setTimeout(() => {
      if (/negocio|abrir|registrar|local|caf|restaurante|tienda/.test(low)) {
        bot('Suena a la apertura de un negocio. ¿Cuántos metros cuadrados tendrá aproximadamente?'); setTrack('negocio'); setStage('size');
      } else if (/alcohol|bar|cerveza/.test(low)) {
        setTrack('negocio'); setSize('100 a 250 m²');
        const d = detectTramite('negocio', '100 a 250 m²', 'Sí');
        bot('Entiendo que venderás alcohol. Este es el trámite que necesitas 👇'); setDetected(d); setStage('detected');
      } else if (/apoyo|cr[eé]dito|fondeso|dinero/.test(low)) {
        const d = detectTramite('apoyo', null, null);
        bot('Buscas apoyo económico. Esto es lo que aplica 👇'); setDetected(d); setStage('detected');
      } else {
        bot('Puedo orientarte mejor con las opciones de arriba 👆, o usa la Consulta rápida para preguntas abiertas.');
      }
    }, 360);
  }

  if (stage === 'success') {
    return (
      <div className="card chat-card">
        <div className="success">
          <div className="check"><Icon name="check" /></div>
          <h2>¡Solicitud enviada!</h2>
          <div className="folio-box"><span className="k">Folio</span><span className="v">{folio}</span></div>
          <p>Recibirás respuesta en tu correo en un máximo de <strong>3 días hábiles</strong>. Guarda tu folio para dar seguimiento.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onSubmitted(folio!, detected?.t ?? 'Trámite', true)}><Icon name="route" />Ver estado de mi trámite</button>
            <button className="btn btn-secondary" onClick={reset}>Iniciar otro trámite</button>
          </div>
        </div>
      </div>
    );
  }

  const startOpts = [
    { id: 'negocio', e: '🏪', label: 'Abrir o registrar un negocio' },
    { id: 'permiso', e: '📄', label: 'Solicitar permiso o licencia' },
    { id: 'apoyo', e: '💼', label: 'Pedir apoyo para mi empresa' },
    { id: 'otro', e: '✉️', label: 'Otro trámite o consulta' }
  ];

  return (
    <div className="card chat-card">
      <div className="chat-scroll" ref={scrollRef}>
        {msgs.map((m, i) => (
          <div className={'msg ' + m.from} key={i}>
            <span className="msg-av">{m.from === 'bot' ? <Icon name="shield" style={{ width: 17, height: 17 }} /> : <Icon name="user" style={{ width: 17, height: 17 }} />}</span>
            <div className="msg-bubble">{m.text}</div>
          </div>
        ))}
      </div>

      {stage === 'start' && (
        <div className="quick-grid">
          {startOpts.map(o => <button className="qbtn" key={o.id} onClick={() => pickStart(o)}><span className="e">{o.e}</span>{o.label}</button>)}
        </div>
      )}
      {stage === 'size' && (
        <div className="quick-row">
          {['Menos de 100 m²', '100 a 250 m²', 'Más de 250 m²', 'No sé aún'].map(s => <button className="qbtn" key={s} onClick={() => pickSize(s)}>{s}</button>)}
        </div>
      )}
      {stage === 'alcohol' && (
        <div className="quick-row">
          {['Sí', 'No'].map(a => <button className="qbtn" key={a} onClick={() => pickAlcohol(a)}>{a}</button>)}
        </div>
      )}
      {stage === 'otro' && (
        <div className="quick-row">
          <button className="qbtn" onClick={goConsulta}>Sí, ir a Consulta rápida</button>
          <button className="qbtn" onClick={reset}>Volver a empezar</button>
        </div>
      )}
      {stage === 'cita' && (
        <div className="detect" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue-bd)' }}>
          <div className="dk" style={{ color: 'var(--blue)' }}>Cita presencial</div>
          <div className="dt" style={{ fontSize: 17 }}>Módulo SEDECO · Centro</div>
          <div className="dsub">Disponible: lun–vie 9:00–14:00 · Av. Cuauhtémoc 899, Narvarte. (Demo)</div>
        </div>
      )}
      {stage === 'detected' && detected && (
        <>
          <div className="detect">
            <div className="dk">{detected.k}</div>
            <div className="dt">{detected.t}</div>
            <div className="dsub">{detected.sub}</div>
            <ul className="doc-check">
              {detected.docs.map((d, i) => <li key={i}><span className="box"><Icon name="check" /></span>{d}</li>)}
            </ul>
            <div className="detect-meta">
              <div><div className="k">Costo</div><div className="v">{detected.costo}</div></div>
              <div><div className="k">Tiempo estimado</div><div className="v">{detected.tiempo}</div></div>
            </div>
          </div>
          <div className="detect-actions">
            <button className="btn btn-primary" onClick={() => setStage('upload')}><Icon name="upload" />Subir mis documentos y enviar</button>
            <button className="btn btn-secondary" onClick={agendar}>Agendar cita presencial</button>
          </div>
        </>
      )}
      {stage === 'upload' && (
        <div style={{ padding: '4px 24px 16px' }}>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf"
            style={{ display: 'none' }} onChange={onFileInput} />
          <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            <div className="dz-ico"><Icon name="upload" /></div>
            <div className="dz-t">Arrastra tus documentos o <b>haz clic aquí</b></div>
            <div className="dz-sub">PDF o imágenes · el OCR extrae el texto automáticamente</div>
            <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
              <button className="btn btn-secondary btn-sm" onClick={simulateDemo}>
                <Icon name="file" />Usar documentos de ejemplo
              </button>
            </div>
          </div>
          {files.length > 0 && (
            <div className="filelist">
              {files.map(f => (
                <div className="filechip" key={f.id}>
                  <span className="fi"><Icon name={/\.(png|jpg|jpeg)$/i.test(f.name) ? 'image' : 'file'} /></span>
                  <div>
                    <div className="fn">{f.name}</div>
                    <div className={'fs ' + (f.status === 'ok' ? 'ok' : f.status === 'error' ? 'error' : 'proc')}>
                      {f.status === 'ok'
                        ? <><Icon name="check" style={{ width: 13, height: 13 }} />Texto extraído · Documento válido</>
                        : f.status === 'error'
                        ? <><Icon name="alert" style={{ width: 13, height: 13 }} />Error al procesar</>
                        : <><span className="mini-spin"></span>Procesando con OCR…</>}
                    </div>
                  </div>
                  <button className="fx" onClick={() => setFiles(x => x.filter(y => y.id !== f.id))}><Icon name="x" /></button>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-block" disabled={!allOk} onClick={() => setStage('confirm')}>
              {allOk ? 'Revisar datos y continuar' : 'Procesando documentos…'}
            </button>
          </div>
        </div>
      )}
      {stage === 'confirm' && (
        <div style={{ padding: '4px 24px 18px' }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Datos detectados — confirma antes de enviar</div>
          <div className="kvbox">
            {Object.keys(Object.keys(extractedFields).length > 0 ? extractedFields : DEMO_FIELDS).map(k => {
              const src = Object.keys(extractedFields).length > 0 ? extractedFields : DEMO_FIELDS;
              return <div className="row" key={k}><span className="k">{k}</span><span className="v">{src[k]}</span></div>;
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={confirmSend}><Icon name="check" />Confirmar y enviar</button>
            <button className="btn btn-secondary" onClick={() => setStage('upload')}>Editar datos</button>
          </div>
        </div>
      )}

      <div className="chat-input">
        <input className="input" placeholder="Escribe aquí tu consulta…" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendText(); }} />
        <button className="chat-send" onClick={sendText}><Icon name="send" /></button>
      </div>
    </div>
  );
}

/* ---- Seguimiento ---- */
const TRACK_STEPS = ['Recibido', 'En revisión', 'Respuesta', 'Completado'];
function stageIndex(estado: string) {
  if (estado === 'completado') return 3;
  if (estado === 'pendiente' || estado === 'revision') return 1;
  return 0;
}

function Seguimiento({ folios, initialFolio }: { folios: Record<string, FolioData>; initialFolio: string | null }) {
  const [folioIn, setFolioIn] = useState(initialFolio || '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<(FolioData & { folio: string }) | null>(
    initialFolio && folios[initialFolio] ? { folio: initialFolio, ...folios[initialFolio] } : null
  );
  const [notFound, setNotFound] = useState(false);

  function search(f?: string) {
    const key = (f || folioIn).trim().toUpperCase();
    const r = folios[key];
    if (r) { setResult({ folio: key, ...r }); setNotFound(false); setFolioIn(key); }
    else { setResult(null); setNotFound(true); }
  }

  useEffect(() => {
    if (initialFolio && folios[initialFolio]) setResult({ folio: initialFolio, ...folios[initialFolio] });
  }, [initialFolio, folios]);

  const idx = result ? stageIndex(result.estado) : 0;
  const si = result ? statusInfo(result.estado) : null;

  return (
    <div className="citizen-wrap narrow">
      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Consulta tu trámite</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>Ingresa tu folio para ver el estado en tiempo real.</p>
        <input className="input input-mono" placeholder="Número de folio (ej. SED-2025-004821)" value={folioIn} onChange={e => setFolioIn(e.target.value)} style={{ marginBottom: 10 }} />
        <input className="input" placeholder="Correo electrónico registrado" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 14 }} />
        <button className="btn btn-primary btn-block" onClick={() => search()}><Icon name="search" />Buscar</button>
        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
          Folios de ejemplo:
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {Object.keys(folios).map(k => <button key={k} className="csg mono" onClick={() => search(k)}>{k}</button>)}
          </div>
        </div>
      </div>

      {notFound && (
        <div className="alert"><span className="ai"><Icon name="alert" /></span><div><div className="at">No encontramos ese folio</div><div className="ad">Verifica el número o búscalo en tu correo de confirmación.</div></div></div>
      )}

      {result && (
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{result.folio}</div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>{result.tipo}</div>
            </div>
            {si && <Badge tone={si.tone} dot>{result.estadoLabel}</Badge>}
          </div>

          <div className="track-progress">
            {TRACK_STEPS.map((s, i) => (
              <>
                {i > 0 && <span key={`line-${i}`} className={'tp-line ' + (i <= idx ? 'fill' : '')}></span>}
                <div key={s} className={'tp-step ' + (i < idx ? 'done' : i === idx ? 'current' : '')}>
                  <span className="tp-dot"><Icon name="check" /></span>
                  <span className="tp-label">{s}</span>
                </div>
              </>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
            <div className="detail-rows">
              <div><div className="k">Trámite</div><div className="v">{result.tipo}</div></div>
              <div><div className="k">Fecha de envío</div><div className="v">{result.enviado}</div></div>
              <div><div className="k">Área asignada</div><div className="v">{result.area}</div></div>
              <div><div className="k">Tiempo estimado</div><div className="v">{result.restante}</div></div>
            </div>
          </div>

          {result.pendiente && (
            <div className="alert" style={{ marginTop: 18 }}>
              <span className="ai"><Icon name="alert" /></span>
              <div style={{ flex: 1 }}>
                <div className="at">{result.pendiente.titulo}</div>
                <div className="ad">{result.pendiente.desc}</div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}><Icon name="upload" />Subir documento</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <div className="section-label">Historial</div>
            <ul className="timeline">
              {result.historial.map((h, i) => (
                <li key={i}><div className="tl-rail"><span className="tl-node"></span><span className="tl-bar"></span></div><div><div className="tl-when">{h.when}</div><div className="tl-what">{h.what}</div></div></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- ConsultaRapida ---- */
function ConsultaRapida({ onIniciar }: { onIniciar: () => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<typeof CONSULTAS[number] | null>(null);
  const [none, setNone] = useState(false);

  function run(query?: string) {
    const low = (query ?? q).toLowerCase().trim();
    if (!low) return;
    const match = CONSULTAS.find(c => c.q.some(k => low.includes(k)));
    if (match) { setRes(match); setNone(false); }
    else { setRes(null); setNone(true); }
  }

  return (
    <div className="citizen-wrap">
      <div className="c-hero" style={{ marginBottom: 18 }}>
        <h1>¿Qué trámite necesitas?</h1>
        <p>Describe lo que quieres hacer y te digo qué documentos, costos y tiempos aplican.</p>
      </div>
      <div className="search-big">
        <Icon name="search" />
        <input className="input" placeholder='Ej: "qué necesito para poner una tortillería"' value={q}
          onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(); }} />
      </div>
      <div className="consulta-suggest">
        {['Poner una taquería', 'Vender alcohol', 'Crédito FONDESO', 'Abrir una tortillería'].map(s => (
          <button className="csg" key={s} onClick={() => { setQ(s); run(s); }}>{s}</button>
        ))}
      </div>

      {none && (
        <div className="card card-pad" style={{ marginTop: 22 }}>
          <Badge tone="gray">Sin coincidencia exacta</Badge>
          <p style={{ marginTop: 12, color: 'var(--ink-2)' }}>No encontré ese trámite específico, pero puedo orientarte. Intenta con palabras como &ldquo;negocio&rdquo;, &ldquo;alcohol&rdquo;, &ldquo;apoyo&rdquo; o inicia un trámite guiado.</p>
        </div>
      )}

      {res && (
        <div className="card card-pad" style={{ marginTop: 22 }}>
          <Badge tone="red" dot>{res.cat}</Badge>
          <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>{res.answer}</p>
          <div className="section-label" style={{ marginTop: 20 }}>Documentos requeridos</div>
          <ul className="doc-check">
            {res.docs.map((d, i) => <li key={i}><span className="box"></span>{d}</li>)}
          </ul>
          <div className="detect-meta" style={{ borderTopColor: 'var(--border)', marginTop: 18 }}>
            <div><div className="k">Costo</div><div className="v">{res.costo}</div></div>
            <div><div className="k">Tiempo</div><div className="v">{res.tiempo}</div></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={onIniciar}><Icon name="arrow-right" />Iniciar este trámite</button>
        </div>
      )}
    </div>
  );
}

/* ---- CitizenPortal shell ---- */
export function CitizenPortal({
  sub, setSub, folios, addFolio, trackFolio, setTrackFolio
}: {
  sub: string; setSub: (s: string) => void;
  folios: Record<string, FolioData>;
  addFolio: (folio: string, tipo: string) => void;
  trackFolio: string | null;
  setTrackFolio: (f: string | null) => void;
}) {
  const tabs = [
    { id: 'tramite', label: 'Iniciar trámite', icon: 'file-plus' },
    { id: 'seguimiento', label: 'Seguimiento', icon: 'route' },
    { id: 'consulta', label: 'Consulta rápida', icon: 'search' }
  ];

  function handleSubmitted(folio: string, tipo: string, goTrack?: boolean) {
    addFolio(folio, tipo);
    if (goTrack) { setTrackFolio(folio); setSub('seguimiento'); }
  }

  return (
    <div>
      <div className="citizen-tabs">
        {tabs.map(t => (
          <button key={t.id} className={'ctab ' + (sub === t.id ? 'active' : '')} onClick={() => setSub(t.id)}>
            <Icon name={t.icon} />{t.label}
          </button>
        ))}
      </div>

      {sub === 'tramite' && (
        <div className="citizen-wrap">
          <div className="c-hero">
            <h1>¿En qué te podemos ayudar hoy?</h1>
            <p>Encuentra tu trámite, sube tus documentos y recibe respuesta sin hacer fila.</p>
          </div>
          <TramiteChat onSubmitted={handleSubmitted} goConsulta={() => setSub('consulta')} />
        </div>
      )}
      {sub === 'seguimiento' && <Seguimiento folios={folios} initialFolio={trackFolio} />}
      {sub === 'consulta' && <ConsultaRapida onIniciar={() => setSub('tramite')} />}
    </div>
  );
}
