export default function Header() {
  return (
    <header className="header">
      <div className="header-top-bar">
        Gobierno de la Ciudad de México — Secretaría de Desarrollo Económico
      </div>
      <div className="header-main">
        <div className="header-logo">
          <svg className="header-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <path d="M 40,40 L 40,20 L 30,20 L 30,30 L 20,30 L 20,40 Z" fill="currentColor" />
            <path d="M 60,40 L 60,20 L 70,20 L 70,30 L 80,30 L 80,40 Z" fill="currentColor" />
            <path d="M 40,60 L 40,80 L 30,80 L 30,70 L 20,70 L 20,60 Z" fill="currentColor" />
            <path d="M 60,60 L 60,80 L 70,80 L 70,70 L 80,70 L 80,60 Z" fill="currentColor" />
          </svg>
          <div>
            <h1>GOB-AGENTS</h1>
            <span>Sistema Multiagente con Supervisión Humana Obligatoria</span>
          </div>
        </div>
        <span className="header-badge">SEDECO CDMX</span>
      </div>
      <div className="decoracion-greca"></div>
    </header>
  );
}
