// ViewToScale.jsx — the "View to scale" button and its popup.
// Usage, under a diamond's description:   <ViewToScale stone="cullinan-i" title="Cullinan I" summary="530.20 ct · Pear · 74 facets" />
// `stone` is a key from STONES in diamond3d.js. `title` and `summary` are optional text for the popup header.
import { useEffect, useRef, useState } from 'react';
import './ViewToScale.css';

let enginePromise = null; // three.js only downloads the first time someone opens a popup
const loadEngine = () => (enginePromise ??= import('./diamond3d.js'));

export default function ViewToScale({ stone, title, summary }) {
  const dialogRef = useRef(null);
  const viewRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState('ct');
  const [life, setLife] = useState(false);
  const [labels, setLabels] = useState(null);
  const engine = useRef(null);

  // Start the viewer when the popup opens, stop it when it closes
  useEffect(() => {
    if (!open) return;
    let stop = null, cancelled = false;
    loadEngine().then(mod => {
      if (cancelled) return;
      engine.current = mod;
      stop = mod.mountViewer(viewRef.current);
      setLabels(mod.showStone(stone, ref, life));
    });
    return () => { cancelled = true; stop?.(); };
    // ref/life changes are handled by the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stone]);

  useEffect(() => {
    if (open && engine.current) setLabels(engine.current.showStone(stone, ref, life));
  }, [ref, life]); // eslint-disable-line react-hooks/exhaustive-deps

  const show = () => { dialogRef.current?.showModal(); setOpen(true); };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className="vts-button" onClick={show}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 9h18M6 4h12l3 5-9 11L3 9z" /></svg>
        View to scale
      </button>

      <dialog
        ref={dialogRef}
        className="vts-dialog"
        aria-label={`${title ?? 'Diamond'} to scale`}
        onClose={() => setOpen(false)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
        }}
        onClick={e => { if (e.target === dialogRef.current) close(); }}
      >
        <div className="vts-inner">
          <div className="vts-head">
            <div>
              <h3>{title}</h3>
              {summary && <p>{summary}</p>}
            </div>
            <button type="button" className="vts-close" onClick={close} aria-label="Close">×</button>
          </div>

          <div className="vts-view" ref={viewRef}>
            {labels && (
              <div className="vts-labels">
                <span>{labels.stone}</span>
                <span>{labels.reference}</span>
              </div>
            )}
          </div>

          <div className="vts-foot">
            <div className="vts-seg" role="group" aria-label="Compare with">
              <button type="button" aria-pressed={ref === 'ct'} onClick={() => setRef('ct')}>Next to a 1 ct diamond</button>
              <button type="button" aria-pressed={ref === 'coin'} onClick={() => setRef('coin')}>Next to a R5 coin</button>
            </div>
            <div className="vts-seg" role="group" aria-label="Zoom">
              <button type="button" aria-pressed={!life} onClick={() => setLife(false)}>Fit</button>
              <button type="button" aria-pressed={life} onClick={() => setLife(true)}>Life size</button>
            </div>
            <p className="vts-note">
              {life ? 'Life size is approximate and depends on your screen. Drag to rotate.' : 'Drag to rotate. Both are drawn at the same scale. 3D shapes are illustrative.'}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
