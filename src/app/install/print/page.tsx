'use client'

const INSTALL_URL = 'https://app.getfidelio.app/install'

export default function PrintQRPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Outfit', system-ui, sans-serif; background: #e8e8e8; }

        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .header {
          background: linear-gradient(135deg, #1E1040 0%, #3D1F8F 60%, #2D1B69 100%);
          padding: 28px 40px;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .logo-box {
          width: 56px; height: 56px; flex-shrink: 0;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .logo-box img { width: 44px; height: 44px; }
        .header-text { color: white; }
        .header-brand { font-size: 30px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; }
        .header-tagline { font-size: 13px; opacity: 0.55; margin-top: 4px; font-weight: 500; }

        /* ── BODY ── */
        .body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 44px 36px;
          gap: 0;
          justify-content: space-between;
        }

        /* ── HEADLINE ── */
        .headline-block { text-align: center; }
        .headline {
          font-size: 26px; font-weight: 900;
          color: #0F0F1A;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .subheadline {
          font-size: 13px; color: #888; font-weight: 500; margin-top: 6px;
        }

        /* ── QR ── */
        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .qr-wrapper {
          position: relative;
          border: 3px solid #ede9fe;
          border-radius: 24px;
          padding: 14px;
          background: white;
          box-shadow: 0 8px 32px rgba(124,58,237,0.12);
        }
        .qr-wrapper img.qr { display: block; width: 220px; height: 220px; }
        .qr-logo {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 54px; height: 54px;
          background: white;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          padding: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .qr-logo img { width: 44px; height: 44px; }
        .qr-url {
          font-family: monospace;
          font-size: 12px; font-weight: 700;
          color: #7C3AED;
          letter-spacing: 0.02em;
          background: #f5f3ff;
          padding: 5px 14px;
          border-radius: 100px;
        }

        /* ── ROLE CARDS ── */
        .roles-row {
          display: flex;
          gap: 16px;
          width: 100%;
        }
        .role-card {
          flex: 1;
          border-radius: 16px;
          padding: 18px 20px;
        }
        .role-card.cliente {
          background: linear-gradient(135deg, rgba(124,58,237,0.06), rgba(124,58,237,0.03));
          border: 2px solid rgba(124,58,237,0.2);
        }
        .role-card.negozio {
          background: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.03));
          border: 2px solid rgba(16,185,129,0.2);
        }
        .role-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .role-icon { font-size: 26px; }
        .role-title { font-size: 15px; font-weight: 800; color: #0F0F1A; }
        .role-desc { font-size: 12px; color: #555; line-height: 1.55; }

        /* ── STEPS ── */
        .steps-section { width: 100%; }
        .steps-label {
          font-size: 10px; font-weight: 800; color: #bbb;
          text-transform: uppercase; letter-spacing: 0.1em;
          text-align: center; margin-bottom: 12px;
        }
        .steps-row { display: flex; gap: 12px; }
        .step-col { flex: 1; }
        .step { display: flex; align-items: flex-start; gap: 10px; }
        .step-num {
          width: 24px; height: 24px; flex-shrink: 0;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 50%;
          color: white; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .step-text { font-size: 11px; color: #444; line-height: 1.5; padding-top: 3px; }

        /* ── FOOTER ── */
        .footer {
          font-size: 11px; color: #ccc;
          text-align: center;
          padding: 16px 0 0;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }

        /* ── PRINT BUTTON ── */
        .print-btn {
          position: fixed; bottom: 24px; right: 24px;
          background: #7C3AED; color: white; border: none;
          padding: 12px 24px; border-radius: 12px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          font-family: inherit; z-index: 100;
        }

        @media print {
          html, body { background: white; }
          .page { margin: 0; width: 210mm; min-height: 297mm; }
          .print-btn { display: none; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="logo-box">
            <img src="/icons/icon-96x96.svg" alt="Fidelio" />
          </div>
          <div className="header-text">
            <div className="header-brand">Fidelio</div>
            <div className="header-tagline">La carta fedeltà digitale per il tuo negozio preferito</div>
          </div>
        </div>

        {/* Body */}
        <div className="body">

          {/* Headline */}
          <div className="headline-block">
            <p className="headline">Scarica l'app gratuita<br />e inizia a guadagnare punti</p>
            <p className="subheadline">Funziona su iPhone e Android — nessun App Store richiesto</p>
          </div>

          {/* QR */}
          <div className="qr-section">
            <div className="qr-wrapper">
              <img
                className="qr"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(INSTALL_URL)}&bgcolor=ffffff&color=1a1a2e&margin=4&ecc=H`}
                alt="QR Code Fidelio"
              />
              <div className="qr-logo">
                <img src="/icons/icon-96x96.svg" alt="Fidelio" />
              </div>
            </div>
            <p className="qr-url">{INSTALL_URL}</p>
          </div>

          {/* Role cards */}
          <div className="roles-row">
            <div className="role-card cliente">
              <div className="role-header">
                <span className="role-icon">👤</span>
                <span className="role-title">Sei un cliente?</span>
              </div>
              <p className="role-desc">Accumula punti ad ogni visita e vinci premi esclusivi in tutti i negozi convenzionati Fidelio.</p>
            </div>
            <div className="role-card negozio">
              <div className="role-header">
                <span className="role-icon">🏪</span>
                <span className="role-title">Hai un negozio?</span>
              </div>
              <p className="role-desc">Crea il tuo programma punti, gestisci i premi e fidelizza i tuoi clienti in pochi minuti.</p>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-section">
            <p className="steps-label">Come installare in 3 secondi</p>
            <div className="steps-row">
              <div className="step-col">
                <div className="step">
                  <div className="step-num">1</div>
                  <p className="step-text"><strong>Inquadra</strong> il QR con la fotocamera del telefono</p>
                </div>
              </div>
              <div className="step-col">
                <div className="step">
                  <div className="step-num">2</div>
                  <p className="step-text"><strong>iPhone:</strong> tocca ⬆️ → "Aggiungi a schermata Home"</p>
                </div>
              </div>
              <div className="step-col">
                <div className="step">
                  <div className="step-num">3</div>
                  <p className="step-text"><strong>Android:</strong> tocca ⋮ → "Aggiungi a schermata Home"</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <p className="footer">Fidelio · app.getfidelio.app · Made with ♥ in Italy</p>
      </div>

      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Stampa
      </button>
    </>
  )
}
