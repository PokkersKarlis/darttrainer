/* Canvas wrappers — Babel/JSX; bez import (globāli no HTML). */

const DesignCanvas = ({ children }) => (
  <div
    className="dt-design-canvas"
    style={{ background: '#08090d', minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}
  >
    {children}
  </div>
);

const DCSection = ({ id, title, children }) => (
  <section id={id} style={{ marginBottom: 48 }}>
    <h2
      style={{
        color: '#e8eaf0',
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 20,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const DCArtboard = ({ id, label, width, height, children }) => (
  <div id={id} style={{ marginBottom: 32, maxWidth: '100%' }}>
    <p style={{ color: '#7b8ba8', fontSize: 12, marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
    <div
      style={{
        width: 'min(100%, ' + width + 'px)',
        minHeight: height,
        overflow: 'auto',
        border: '1px solid #252d3d',
        borderRadius: 12,
      }}
    >
      {children}
    </div>
  </div>
);
