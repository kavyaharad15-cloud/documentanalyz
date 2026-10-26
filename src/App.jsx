import { useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, Check, ChevronDown, FileText, FileUp,
  Fingerprint, LoaderCircle, LockKeyhole, Menu, RotateCcw, Sparkles,
  WandSparkles, X,
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const sample = {
  documentType: 'Research paper',
  summary: 'The paper examines how urban green spaces affect public health. It finds that access to parks is associated with increased physical activity and improved self-reported wellbeing, while noting that neighborhood income and park quality influence these outcomes.',
  keyPoints: [
    'Residents living near accessible parks reported more frequent weekly exercise.',
    'Park maintenance and perceived safety affected whether residents used nearby green spaces.',
    'The study identifies an association and does not establish that parks alone caused the reported health outcomes.',
  ],
  entities: ['Urban green spaces', 'Public health', 'Physical activity', 'Community wellbeing'],
  pages: 18,
  truncated: false,
};

function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function selectFile(next) {
    setError(''); setResult(null);
    if (!next) return;
    if (next.type !== 'application/pdf' && !next.name.toLowerCase().endsWith('.pdf')) {
      setFile(null); setError('That file type is not supported. Choose a PDF.'); return;
    }
    if (next.size > 12 * 1024 * 1024) {
      setFile(null); setError('This PDF is larger than 12 MB. Choose a smaller file.'); return;
    }
    setFile(next);
  }

  async function analyze() {
    if (!file) { setError('Choose a PDF before starting your analysis.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const form = new FormData(); form.append('document', file);
      const response = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Analysis could not be completed.');
      setResult(data);
    } catch (err) {
      setError(err.message === 'Failed to fetch'
        ? 'The analysis service is not connected yet. You can explore the sample result below, or connect the backend to enable live analysis.'
        : err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  function reset() { setFile(null); setResult(null); setError(''); if (inputRef.current) inputRef.current.value = ''; }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Papertrail home">
        <span className="brand-mark"><FileText size={19} strokeWidth={1.8} /></span>
        <span>papertrail<span className="brand-period">.</span></span>
      </a>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
      </nav>
      <div className="nav-actions">
        <span className="privacy-pill"><LockKeyhole size={13} /> Private by design</span>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={20} /></button>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DOCUMENTS, MADE CLEARER</div>
          <h1>Big documents.<br /><span>Clear thinking.</span></h1>
          <p className="hero-intro">Turn long PDFs into the ideas that matter. Get a thoughtful summary, key points, and the details you’re looking for.</p>
          <div className="hero-meta"><span><Check size={14} /> Minutes, not hours</span><i /><span><Check size={14} /> Your files aren’t stored</span></div>
        </div>

        <section className="analyzer-card" aria-label="Analyze a document">
          <div className="card-heading">
            <div><span className="mini-label">DOCUMENT ANALYZER</span><h2>What would you like to understand?</h2></div>
            <div className="sparkle-badge"><WandSparkles size={18} /></div>
          </div>
          <div
            className={`dropzone ${dragging ? 'dropzone-active' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); selectFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            role="button" tabIndex={0} aria-label="Choose or drop a PDF file"
          >
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden onChange={(e) => selectFile(e.target.files[0])} />
            {file ? <>
              <span className="file-icon"><FileText size={22} /></span>
              <span className="drop-title">{file.name}</span>
              <span className="drop-subtitle">{formatSize(file.size)} · PDF document</span>
              <button className="remove-file" onClick={(e) => { e.stopPropagation(); reset(); }} aria-label="Remove file"><X size={15} /></button>
            </> : <>
              <span className="upload-icon"><FileUp size={21} /></span>
              <span className="drop-title">Drop your PDF here</span>
              <span className="drop-subtitle">or <span className="browse-link">browse files</span> from your device</span>
              <span className="file-limit">PDF only · Up to 12 MB</span>
            </>}
          </div>
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="analyze-button" onClick={analyze} disabled={loading}>
            {loading ? <><LoaderCircle size={17} className="spin" /> Reading your document…</> : <><Sparkles size={16} /> Analyze document <ArrowRight size={16} /></>}
          </button>
          <div className="card-footnote"><LockKeyhole size={12} /> Files are processed for your request and not saved by this app.</div>
          {!API_URL && <button className="sample-link" onClick={() => { setError(''); setResult({ ...sample, isSample: true }); }}>See an example result <ArrowRight size={13} /></button>}
        </section>
        <div className="hero-deco deco-one" /><div className="hero-deco deco-two" />
      </section>

      {result && <section className="results-section" aria-live="polite">
        <div className="results-topline"><div><span className="mini-label">YOUR DOCUMENT BRIEF</span><h2>{result.isSample ? 'A clear view of the big picture.' : 'Here’s what we found.'}</h2></div><button className="reset-button" onClick={reset}><RotateCcw size={14} /> New document</button></div>
        {result.isSample && <div className="sample-notice">Example result · This is sample content, not analysis of an uploaded file.</div>}
        {result.truncated && <div className="sample-notice">The document was long, so only the first portion was analyzed.</div>}
        <div className="result-grid">
          <article className="result-card summary-card"><span className="result-label"><span className="label-dot lilac" /> THE SHORT VERSION</span><p>{result.summary}</p><div className="result-source"><FileText size={14} /> {result.documentType || 'Your PDF'}{result.pages ? ` · ${result.pages} pages` : ''}</div></article>
          <article className="result-card points-card"><span className="result-label"><span className="label-dot coral" /> KEY TAKEAWAYS</span><ol>{(result.keyPoints || []).map((point, i) => <li key={i}><span className="point-num">0{i + 1}</span><span>{point}</span></li>)}</ol></article>
          <article className="result-card entities-card"><span className="result-label"><span className="label-dot mint" /> PEOPLE & IDEAS</span><div className="entity-list">{(result.entities || []).map((entity, i) => <span className="entity-chip" key={i}>{entity}</span>)}</div></article>
        </div>
        <p className="verify-note"><Fingerprint size={15} /> AI can miss context. Check important details against your original document.</p>
      </section>}

      <section className="trust-strip" id="features">
        <div className="trust-item"><span className="trust-icon lavender"><LockKeyhole size={18} /></span><div><strong>Private by design</strong><span>Your document isn’t saved by the app.</span></div></div>
        <div className="trust-item"><span className="trust-icon peach"><WandSparkles size={18} /></span><div><strong>More than a summary</strong><span>Find useful themes, names, and details.</span></div></div>
        <div className="trust-item"><span className="trust-icon sage"><ArrowDownToLine size={18} /></span><div><strong>Simple to get started</strong><span>Upload a PDF and let the reading begin.</span></div></div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-kicker">A LITTLE LESS SCROLLING</div><h2>From PDF to <em>aha.</em></h2>
        <div className="steps-grid">
          <div className="step"><span className="step-number">01</span><h3>Bring your PDF</h3><p>Choose a text-based PDF from your device. Your file is handled securely for this request.</p></div>
          <div className="step"><span className="step-number">02</span><h3>We find the signal</h3><p>Text is extracted and organized into a concise summary, key points, and useful details.</p></div>
          <div className="step"><span className="step-number">03</span><h3>Get to the good part</h3><p>Review a clear brief, then return to the original whenever you need more context.</p></div>
        </div>
      </section>
      <section className="closing-note"><span>GOOD TO KNOW</span><p>Scanned PDFs may need optical character recognition. Always double-check important facts in the source document.</p><ChevronDown size={17} /></section>
    </main>
    <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><FileText size={16} /></span><span>papertrail<span className="brand-period">.</span></span></a><span>Made for clearer reading.</span><span className="footer-dot">●</span><span>© 2026</span></footer>
  </div>;
}
