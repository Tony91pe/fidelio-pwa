'use client'

const INSTALL_URL = 'https://getfidelio.app/install'

export default function PrintQRPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Outfit', system-ui, sans-serif; background: #f0f0f0; }

        .page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── HEADER ── */
        .header {
          background: linear-gradient(135deg, #1E1040 0%, #2D1B69 100%);
          padding: 14px 32px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .logo {
          width: 44px; height: 44px; flex-shrink: 0;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900; color: white;
        }
        .header-text { color: white; }
        .header-brand { font-size: 22px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }
        .header-tagline { font-size: 11px; opacity: 0.5; margin-top: 2px; }

        /* ── BODY ── */
        .body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 32px 14px;
          gap: 14px;
          overflow: hidden;
        }

        .headline {
          font-size: 20px; font-weight: 900;
          color: #0F0F1A;
          text-align: center;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        /* ── QR + ROLES row ── */
        .middle {
          display: flex;
          align-items: stretch;
          gap: 20px;
          width: 100%;
        }

        .qr-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .qr-wrapper {
          border: 2px solid #ede9fe;
          border-radius: 16px;
          padding: 10px;
          background: white;
        }
        .qr-wrapper img { display: block; width: 168px; height: 168px; }
        .url {
          font-family: monospace;
          font-size: 11px; font-weight: 700;
          color: #7C3AED;
          letter-spacing: 0.01em;
        }

        .right-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .role-card {
          border-radius: 12px;
          padding: 12px 14px;
          flex: 1;
        }
        .role-card.cliente { background: rgba(124,58,237,0.06); border: 1.5px solid rgba(124,58,237,0.2); }
        .role-card.negozio { background: rgba(16,185,129,0.06); border: 1.5px solid rgba(16,185,129,0.2); }
        .role-header { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .role-icon { font-size: 20px; }
        .role-title { font-size: 13px; font-weight: 800; color: #0F0F1A; }
        .role-desc { font-size: 11px; color: #555; line-height: 1.45; }

        /* ── DIVIDER ── */
        .divider { width: 100%; height: 1px; background: #f0f0f0; flex-shrink: 0; }

        /* ── STEPS ── */
        .steps-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .steps-label {
          font-size: 10px; font-weight: 700; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 6px;
        }
        .step-col { flex: 1; }
        .step { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 5px; }
        .step-num {
          width: 20px; height: 20px; flex-shrink: 0;
          background: #7C3AED; border-radius: 50%;
          color: white; font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .step-text { font-size: 10.5px; color: #444; line-height: 1.4; padding-top: 2px; }

        /* ── FOOTER ── */
        .footer {
          font-size: 10px; color: #ccc;
          text-align: center;
          padding-bottom: 4px;
          flex-shrink: 0;
        }

        /* ── PRINT BUTTON (screen only) ── */
        .print-btn {
          position: fixed; bottom: 24px; right: 24px;
          background: #7C3AED; color: white; border: none;
          padding: 12px 24px; border-radius: 12px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          font-family: inherit; z-index: 100;
        }

        @media print {
          html, body { background: white; height: 297mm; }
          .page { margin: 0; width: 210mm; height: 297mm; }
          .print-btn { display: none; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="logo">F</div>
          <div className="header-text">
            <div className="header-brand">Fidelio</div>
            <div className="header-tagline">La carta fedeltà digitale per tutti i negozi</div>
          </div>
        </div>

        {/* Body */}
        <div className="body">

          <p className="headline">Scarica l'app gratuita e inizia<br />a guadagnare punti</p>

          {/* QR + role cards */}
          <div className="middle">
            <div className="qr-col">
              <div className="qr-wrapper">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=336x336&data=${encodeURIComponent(INSTALL_URL)}&bgcolor=ffffff&color=1a1a2e&margin=6&qzone=1`}
                  alt="QR Code Fidelio"
                />
              </div>
              <p className="url">{INSTALL_URL}</p>
            </div>

            <div className="right-col">
              <div className="role-card cliente">
                <div className="role-header">
                  <span className="role-icon">👤</span>
                  <span className="role-title">Sei un cliente?</span>
                </div>
                <p className="role-desc">Accumula punti ad ogni visita e vinci premi esclusivi in tutti i negozi Fidelio.</p>
              </div>
              <div className="role-card negozio">
                <div className="role-header">
                  <span className="role-icon">🏪</span>
                  <span className="role-title">Hai un negozio?</span>
                </div>
                <p className="role-desc">Crea il tuo programma punti, gestisci premi e fidelizza i tuoi clienti.</p>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Steps */}
          <div style={{ width: '100%' }}>
            <p className="steps-label">Come installare</p>
            <div className="steps-row">
              <div className="step-col">
                <div className="step">
                  <div className="step-num">1</div>
                  <p className="step-text"><strong>iPhone/iPad:</strong> Apri Safari, tocca ⬆️ e poi "Aggiungi a schermata Home"</p>
                </div>
              </div>
              <div className="step-col">
                <div className="step">
                  <div className="step-num">2</div>
                  <p className="step-text"><strong>Android:</strong> Apri Chrome, tocca ⋮ e poi "Aggiungi a schermata Home"</p>
                </div>
              </div>
              <div className="step-col">
                <div className="step">
                  <div className="step-num">3</div>
                  <p className="step-text">Nessun App Store — gratuito e istantaneo su qualsiasi smartphone</p>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

        </div>

        <p className="footer">Fidelio · getfidelio.app · Made with ♥ in Italy</p>
      </div>

      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Stampa
      </button>
    </>
  )
}
