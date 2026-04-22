import { useState, useEffect, useRef, useCallback } from 'react';
import { UPLOADS_BY_ROOM } from './uploads.js';

/* Resolve a photo item to a live image URL.
   - If `uploadRef: { room, filename }` is set, look up the current Vite URL.
   - Otherwise fall back to `src` (web URLs, legacy paths).
   Returns null if the uploadRef points to a file that's no longer in the folder. */
function resolvePhotoSrc(item) {
  if (item.uploadRef) {
    const list = UPLOADS_BY_ROOM[item.uploadRef.room] || [];
    const match = list.find(p => p.filename === item.uploadRef.filename);
    return match ? match.src : null;
  }
  return item.src || null;
}

/* ============================================================
   Draggable hook — captures start position at mousedown.
   getPos() returns { x, y, zoom } so incremental mousemoves
   always resolve against the SAME start position, not a stale
   closure value. This fixes "things won't move" bugs.
============================================================ */
function useDrag(getPos, setPos, onStart, onEnd) {
  const state = useRef({ dragging: false });

  const onMouseDown = useCallback((e) => {
    if (e.target.closest(
      'button, textarea, input, a, [contenteditable], ' +
      '.phase .status, .sticky .sig, .listpad li .box, ' +
      '.paint-chip .swatch, .delete, .row-del, .grip'
    )) return;
    e.preventDefault();
    const start = getPos();
    state.current = {
      dragging: true,
      sx: e.clientX, sy: e.clientY,
      x0: start.x, y0: start.y,
      zoom: start.zoom || 1,
    };
    onStart && onStart();
    const move = (ev) => {
      if (!state.current.dragging) return;
      const dx = (ev.clientX - state.current.sx) / state.current.zoom;
      const dy = (ev.clientY - state.current.sy) / state.current.zoom;
      setPos(state.current.x0 + dx, state.current.y0 + dy);
    };
    const up = () => {
      state.current.dragging = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      onEnd && onEnd();
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [getPos, setPos, onStart, onEnd]);

  return onMouseDown;
}

/* Helper that builds getPos/setPos for a positioned item */
function posHandlers(item, onChange, zoom) {
  const getPos = () => ({ x: item.x, y: item.y, zoom });
  const setPos = (x, y) => onChange({ x, y });
  const onStart = () => onChange({ z: Date.now() });
  return { getPos, setPos, onStart };
}

/* ============================================================
   Photo pin
============================================================ */
function PhotoPin({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const editCaption = (v) => onChange({ caption: v });

  return (
    <div
      className="pin photo"
      style={{
        left: item.x, top: item.y,
        width: item.w, height: item.h + 56,
        transform: `rotate(${item.rot || 0}deg)`,
        zIndex: item.z || 1,
      }}
      onMouseDown={drag}
    >
      <span className="tape tl"></span>
      <span className="tape tr"></span>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>

      {item.kind === 'placeholder' ? (
        <div className="photo placeholder" style={{ width: item.w - 20, height: item.h, padding: 0, boxShadow: 'none' }}>
          <div className="ph-label">
            drop photo<br/>here
          </div>
        </div>
      ) : (() => {
        const resolvedSrc = resolvePhotoSrc(item);
        if (!resolvedSrc) {
          // File was deleted from the folder — show a clear placeholder
          return (
            <div className="photo placeholder" style={{ width: item.w - 20, height: item.h, padding: 0, boxShadow: 'none' }}>
              <div className="ph-label" style={{ fontSize: 11, color: '#a33' }}>
                missing file<br/>
                <span style={{ fontSize: 9, opacity: 0.7 }}>
                  {item.uploadRef ? item.uploadRef.filename : 'no source'}
                </span>
              </div>
            </div>
          );
        }
        return (
          <img
            src={resolvedSrc}
            style={{ width: item.w - 20, height: item.h }}
            draggable={false}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        );
      })()}

      <div className="caption">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => editCaption(e.target.innerText)}
        >{item.caption}</span>
        <span
          className="src"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange({ src_note: e.target.innerText })}
          style={{ outline: 'none' }}
        >{item.src_note}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Sticky note — single click to edit
============================================================ */
function StickyPin({ item, onChange, onDelete, zoom, whoInitial }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const commit = (e) => onChange({ text: e.target.innerText });

  return (
    <div
      className={`pin sticky ${item.color}`}
      style={{
        left: item.x, top: item.y,
        transform: `rotate(${item.rot || 0}deg)`,
        zIndex: item.z || 1,
      }}
      onMouseDown={drag}
    >
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      <div
        className="sticky-text"
        contentEditable
        suppressContentEditableWarning
        onBlur={commit}
        style={{ whiteSpace: 'pre-wrap', minHeight: 60, outline: 'none', cursor: 'text' }}
      >{item.text}</div>
      <div className="sig">
        <span>note</span>
        <span className="initials">~ {item.author || whoInitial}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Tag chip (common element)
============================================================ */
function TagPin({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);
  return (
    <div
      className={`pin tag ${item.color}`}
      style={{ left: item.x, top: item.y, zIndex: item.z || 1 }}
      onMouseDown={drag}
    >
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ label: e.target.innerText })}
        style={{ outline: 'none' }}
      >{item.label}</span>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
    </div>
  );
}

/* ============================================================
   Checklist pad — with per-row delete
============================================================ */
function ListPad({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const toggle = (i) => {
    const items = item.items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it);
    onChange({ items });
  };
  const editText = (i, text) => {
    const items = item.items.map((it, idx) => idx === i ? { ...it, text } : it);
    onChange({ items });
  };
  const add = () => {
    onChange({ items: [...item.items, { text: 'new task', done: false }] });
  };
  const remove = (i) => {
    onChange({ items: item.items.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="pin listpad" style={{ left: item.x, top: item.y, zIndex: item.z || 1 }} onMouseDown={drag}>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      <div
        className="pad-title"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ title: e.target.innerText })}
      >{item.title}</div>
      <div
        className="pad-sub"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ sub: e.target.innerText })}
      >{item.sub}</div>
      <ul>
        {item.items.map((it, i) => (
          <li key={i} className={it.done ? 'done' : ''}>
            <span className="box" onClick={() => toggle(i)}></span>
            <span
              className="text"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editText(i, e.target.innerText)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !e.target.innerText.trim()) {
                  e.preventDefault();
                  remove(i);
                }
              }}
            >{it.text}</span>
            <button
              className="row-del"
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              title="Remove task"
            >×</button>
          </li>
        ))}
        <li className="addrow" onClick={add}>
          <span className="box"></span>
          <span>+ add task</span>
        </li>
      </ul>
    </div>
  );
}

/* ============================================================
   Timeline card — reorderable phases, editable, deletable
============================================================ */
function TimelineCard({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const cycleStatus = (i) => {
    const cycle = ['todo', 'active', 'done'];
    const phases = item.phases.map((p, idx) => {
      if (idx !== i) return p;
      const next = cycle[(cycle.indexOf(p.status || 'todo') + 1) % cycle.length];
      return { ...p, status: next };
    });
    onChange({ phases });
  };
  const editField = (i, key, val) => {
    const phases = item.phases.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    onChange({ phases });
  };
  const addPhase = () => {
    onChange({ phases: [...item.phases, { label: 'new phase', meta: 'date', status: 'todo' }] });
  };
  const removePhase = (i) => {
    onChange({ phases: item.phases.filter((_, idx) => idx !== i) });
  };
  const move = (from, to) => {
    if (from === to || to < 0 || to >= item.phases.length) return;
    const phases = item.phases.slice();
    const [moved] = phases.splice(from, 1);
    phases.splice(to, 0, moved);
    onChange({ phases });
  };

  const statusLabel = (s) => s === 'done' ? '✓ done' : s === 'active' ? '↺ in progress' : '◦ todo';

  return (
    <div className="pin timeline-card" style={{ left: item.x, top: item.y, zIndex: item.z || 1 }} onMouseDown={drag}>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      <div className="tc-title">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange({ title: e.target.innerText })}
        >{item.title || 'Phase plan'}</span>
        <span className="phase-count">{item.phases.length} phases · drag ⋮⋮ to reorder</span>
      </div>
      {item.phases.map((p, i) => (
        <div
          key={i}
          className={`phase ${p.status || 'todo'} ${dragIdx === i ? 'phase-dragging' : ''} ${overIdx === i && dragIdx !== null && dragIdx !== i ? 'phase-drop' : ''}`}
          draggable={dragIdx === i}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(i));
          }}
          onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
          onDragLeave={() => setOverIdx(o => o === i ? null : o)}
          onDrop={(e) => {
            e.preventDefault();
            const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
            move(from, i);
            setDragIdx(null);
            setOverIdx(null);
          }}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
        >
          <span
            className="grip"
            title="Drag to reorder"
            onMouseDown={(e) => { e.stopPropagation(); setDragIdx(i); }}
            onMouseUp={() => setDragIdx(null)}
          >⋮⋮</span>
          <div className="dot">{i + 1}</div>
          <div className="label">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editField(i, 'label', e.target.innerText)}
              style={{ outline: 'none', display: 'block' }}
            >{p.label}</span>
            <span
              className="meta"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editField(i, 'meta', e.target.innerText)}
              style={{ outline: 'none' }}
            >{p.meta}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <div className="status" onClick={() => cycleStatus(i)}>
              {statusLabel(p.status || 'todo')}
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                className="row-del"
                onClick={(e) => { e.stopPropagation(); move(i, i - 1); }}
                title="Move up"
                disabled={i === 0}
              >↑</button>
              <button
                className="row-del"
                onClick={(e) => { e.stopPropagation(); move(i, i + 1); }}
                title="Move down"
                disabled={i === item.phases.length - 1}
              >↓</button>
              <button
                className="row-del"
                onClick={(e) => { e.stopPropagation(); removePhase(i); }}
                title="Remove phase"
              >×</button>
            </div>
          </div>
        </div>
      ))}
      <div className="add-chip" onClick={addPhase} style={{ marginTop: 10 }}>+ add phase</div>
    </div>
  );
}

/* ============================================================
   Product / sourcing links card
   Inline editable, per-row delete button
============================================================ */
function LinksCard({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const addLink = () => {
    onChange({ items: [...item.items, { name: 'new product', vendor: 'vendor', price: '$—', url: '#' }] });
  };
  const removeLink = (i) => {
    onChange({ items: item.items.filter((_, idx) => idx !== i) });
  };
  const editField = (i, key, val) => {
    const items = item.items.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    onChange({ items });
  };
  const setUrl = (i) => {
    const url = prompt('Link URL:', item.items[i].url || 'https://');
    if (url !== null) editField(i, 'url', url || '#');
  };

  return (
    <div className="pin links-card" style={{ left: item.x, top: item.y, zIndex: item.z || 1 }} onMouseDown={drag}>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      <div
        className="lc-title"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ title: e.target.innerText })}
      >{item.title || 'Sourcing'}</div>
      {item.items.map((p, i) => (
        <div key={i} className="product">
          <span
            className="name"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => editField(i, 'name', e.target.innerText)}
            style={{ outline: 'none' }}
          >{p.name}</span>
          <span
            className="price"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => editField(i, 'price', e.target.innerText)}
            style={{ outline: 'none' }}
          >{p.price}</span>
          <span
            className="vendor"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => editField(i, 'vendor', e.target.innerText)}
            style={{ outline: 'none' }}
          >{p.vendor}</span>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, marginTop: 4, justifyContent: 'flex-end' }}>
            {p.url && p.url !== '#' && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-red)', textDecoration: 'none' }}
              >↗ open</a>
            )}
            <button
              className="row-del"
              onClick={(e) => { e.stopPropagation(); setUrl(i); }}
              title="Set link URL"
              style={{ color: 'var(--ink-soft)' }}
            >⛓ link</button>
            <button
              className="row-del"
              onClick={(e) => { e.stopPropagation(); removeLink(i); }}
              title="Remove"
            >× remove</button>
          </div>
        </div>
      ))}
      <div className="addlink" onClick={addLink}>+ add source</div>
    </div>
  );
}

/* ============================================================
   Paint swatch card
============================================================ */
function PaintCard({ item, onChange, onDelete, zoom }) {
  const { getPos, setPos, onStart } = posHandlers(item, onChange, zoom);
  const drag = useDrag(getPos, setPos, onStart);

  const addChip = () => {
    onChange({ chips: [...item.chips, { name: 'new paint', vendor: 'Farrow & Ball', hex: '#cccccc', use: 'on —', code: '' }] });
  };
  const removeChip = (i) => {
    onChange({ chips: item.chips.filter((_, idx) => idx !== i) });
  };
  const editChip = (i, key, val) => {
    const chips = item.chips.map((c, idx) => idx === i ? { ...c, [key]: val } : c);
    onChange({ chips });
  };
  const recolor = (i) => {
    const hex = prompt('New hex color (e.g. #4A6F8A):', item.chips[i].hex);
    if (hex) editChip(i, 'hex', hex);
  };

  return (
    <div className="pin paint-card" style={{ left: item.x, top: item.y, zIndex: item.z || 1 }} onMouseDown={drag}>
      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      <div className="pc-title">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange({ title: e.target.innerText })}
        >{item.title || 'Paint'}</span>
        <span className="count">{item.chips.length} chip{item.chips.length === 1 ? '' : 's'}</span>
      </div>
      {item.chips.map((c, i) => (
        <div key={i} className="paint-chip">
          <div
            className="swatch"
            style={{ background: c.hex }}
            onClick={() => recolor(i)}
            title="Click swatch to change hex"
          />
          <div className="info">
            <span
              className="name"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editChip(i, 'name', e.target.innerText)}
            >{c.name}</span>
            <span
              className="vendor"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editChip(i, 'vendor', e.target.innerText)}
              style={{ outline: 'none' }}
            >{c.vendor}</span>
            <span
              className="use"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editChip(i, 'use', e.target.innerText)}
            >{c.use || 'on —'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span
              className="code"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editChip(i, 'code', e.target.innerText)}
              style={{ outline: 'none' }}
            >{c.code}</span>
            <button
              className="row-del"
              onClick={(e) => { e.stopPropagation(); removeChip(i); }}
              title="Remove paint"
            >×</button>
          </div>
        </div>
      ))}
      <div className="add-chip" onClick={addChip}>+ add paint</div>
    </div>
  );
}

export { PhotoPin, StickyPin, TagPin, ListPad, TimelineCard, LinksCard, PaintCard };
