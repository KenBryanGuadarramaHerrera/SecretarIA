'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/platform/Icons';
import { CitizenPortal } from '@/components/platform/CitizenPortal';
import { AdminPanel } from '@/components/platform/AdminPanel';
import { INBOX, FOLIOS } from '@/data/sedeco';
import type { InboxItem, FolioData } from '@/data/sedeco';

export default function Home() {
  const [mode, setMode] = useState<'citizen' | 'admin'>('citizen');
  const [sub, setSub] = useState('tramite');
  const [trackFolio, setTrackFolio] = useState<string | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>(() => INBOX.map(r => ({ ...r })));
  const [folios, setFolios] = useState<Record<string, FolioData>>(() => ({ ...FOLIOS }));

  function addFolio(folio: string, tipo: string) {
    setFolios(f => ({
      ...f,
      [folio]: {
        tipo, estado: 'revision', estadoLabel: 'En revisión',
        enviado: '5 de junio, 2025', area: 'Dirección de Establecimientos Mercantiles', restante: '3 días hábiles',
        pendiente: null,
        historial: [
          { when: 'Ahora', what: 'Solicitud recibida y en cola de revisión' },
          { when: 'Ahora', what: 'Documentos validados por OCR' },
          { when: 'Ahora', what: 'Solicitud enviada correctamente' }
        ]
      }
    }));
  }

  function resolveCaso(folio: string, kind: string) {
    setInbox(list => list.map(r => r.folio !== folio ? r : { ...r, status: kind === 'info' ? 'pendiente' : 'resuelto' } as InboxItem));
  }

  return (
    <>
      <header className="uheader">
        <div className="uheader-in">
          <span className="uband"></span>
          <Image className="ulogo-cdmx" src="/assets/logo_cdmx.png" alt="Gobierno de la Ciudad de México" width={110} height={36} priority />
          <span className="udiv"></span>
          <span className="ubrand">Secretar<b>IA</b></span>
          <span className="uactive" title="Modelo Saptiva KAL en línea"><span className="d"></span>Saptiva KAL · activo</span>
          <span className="uspace"></span>
          <div className="mode-switch">
            <button className={mode === 'citizen' ? 'active' : ''} onClick={() => setMode('citizen')}><Icon name="user" />Ciudadano</button>
            <button className={mode === 'admin' ? 'active' : ''} onClick={() => setMode('admin')}><Icon name="building" />Funcionario</button>
          </div>
        </div>
      </header>

      {mode === 'citizen'
        ? <CitizenPortal sub={sub} setSub={setSub} folios={folios} addFolio={addFolio} trackFolio={trackFolio} setTrackFolio={setTrackFolio} />
        : <AdminPanel inbox={inbox} resolveCaso={resolveCaso} />}
    </>
  );
}
