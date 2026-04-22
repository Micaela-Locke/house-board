import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  PhotoPin, StickyPin, TagPin, ListPad, TimelineCard, LinksCard, PaintCard
} from './Pins.jsx';
import { ROOMS, STARTER_BOARDS } from './data.js';
import { UPLOADED_IMAGES, UPLOADS_BY_ROOM } from './uploads.js';

/* Build a starter board for a given room, auto-populating photos from
   src/uploads/{roomId}/ if the starter doesn't already define any. */
function buildStarterBoard(roomId) {
  const starter = STARTER_BOARDS[roomId] || {};
  const autoPhotos = UPLOADS_BY_ROOM[roomId] || [];
  const photos = (starter.photos && starter.photos.length > 0)
    ? starter.photos
    : autoPhotos.map((p, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return {
          id: `auto-${roomId}-${i}`,
          uploadRef: { room: roomId, filename: p.filename },
          x: 260 + col * 360,
          y: 260 + row * 360,
          w: 300,
          h: 300,
          caption: '',
          src_note: '',
          rot: ((i * 37) % 7) - 3,
        };
      });
  return { ...starter, photos, strokes: [] };
}

const STORAGE_KEY = 'house-board-v1';
const TWEAKS_KEY = 'house-board-tweaks-v1';

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "paperTone": "cream",
  "inkColor": "indigo",
  "gridDensity": "standard",
  "authorInitials": "M/W"
}/*EDITMODE-END*/;

/* ---------- Drawing stroke type ---------- */
// { id, color, width, points: [[x,y]...] }

function App() {
  // Load state
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration: inject any newly-added rooms using their starter board.
        // Preserves user edits on existing rooms.
        if (parsed.boards) {
          ROOMS.forEach(r => {
            if (!parsed.boards[r.id]) {
              parsed.boards[r.id] = buildStarterBoard(r.id);
            }
            // Ensure paint palette exists on rooms that have one in the starter
            const b = parsed.boards[r.id];
            if (b && !b.paint && STARTER_BOARDS[r.id] && STARTER_BOARDS[r.id].paint) {
              b.paint = STARTER_BOARDS[r.id].paint;
            }
          });
          // Migration: any photo with a src like "/src/uploads/ROOM/FILE"
          // gets converted to uploadRef form. This is a one-time upgrade for
          // existing localStorage state so photos don't break after Vite restart.
          Object.entries(parsed.boards).forEach(([roomId, b]) => {
            if (b && b.photos) {
              b.photos = b.photos.map(p => {
                if (!p.uploadRef && typeof p.src === 'string') {
                  // Match /src/uploads/ROOM/FILENAME (possibly with ?query and URL-encoded spaces)
                  const m = p.src.match(/\/src\/uploads\/([^/]+)\/([^?]+)/);
                  if (m) {
                    const filename = decodeURIComponent(m[2]);
                    const { src, ...rest } = p;
                    return { ...rest, uploadRef: { room: m[1], filename } };
                  }
                }
                return p;
              });
            }
          });
          // If the saved currentRoom no longer exists, fall back to the first room.
          if (!ROOMS.some(r => r.id === parsed.currentRoom)) {
            parsed.currentRoom = ROOMS[0].id;
          }
        }
        return parsed;
      }
    } catch(e) {}
    const boards = {};
    ROOMS.forEach(r => {
      boards[r.id] = buildStarterBoard(r.id);
    });
    return {
      currentRoom: 'zuzu-bath',
      who: 'M',
      boards,
    };
  });

  const [tweaks, setTweaks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TWEAKS_KEY) || '{}');
      // Migrate old default
      if (saved.authorInitials === 'E/J') saved.authorInitials = 'M/W';
      return { ...DEFAULT_TWEAKS, ...saved };
    }
    catch(e) { return DEFAULT_TWEAKS; }
  });

  const [tool, setTool] = useState('select'); // select | pen | highlight | eraser
  const [inkColor, setInkColor] = useState('ink'); // ink | red | blue | green | yellow
  const [zoom, setZoom] = useState(1);
  const [picker, setPicker] = useState(null); // { kind, onPick }
  const [tweaksOn, setTweaksOn] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    localStorage.setItem(TWEAKS_KEY, JSON.stringify(tweaks));
  }, [tweaks]);

  // Manual save — useful as a deliberate "commit this arrangement" action.
  // Also writes to a second slot (house-board-snapshot) so we have a
  // known-good version even if the auto-save state gets corrupted later.
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'
  const saveNow = () => {
    setSaveStatus('saving');
    try {
      const payload = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, payload);
      localStorage.setItem('house-board-snapshot', payload);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 1500);
    } catch (e) {
      alert('Save failed: ' + (e.message || e));
      setSaveStatus('');
    }
  };

  // Edit mode / Tweaks wiring
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOn(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const setTweak = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  };

  const roomMeta = state.roomMeta || {};
  const getRoom = (r) => ({ ...r, ...(roomMeta[r.id] || {}) });
  const currentRoom = getRoom(ROOMS.find(r => r.id === state.currentRoom));
  const board = state.boards[state.currentRoom];

  const updateRoomMeta = (id, patch) => {
    setState(s => ({
      ...s,
      roomMeta: { ...(s.roomMeta || {}), [id]: { ...((s.roomMeta || {})[id] || {}), ...patch } },
    }));
  };

  // Update helpers
  const patchBoard = (patch) => {
    setState(s => ({
      ...s,
      boards: {
        ...s.boards,
        [s.currentRoom]: { ...s.boards[s.currentRoom], ...patch },
      },
    }));
  };

  const updateItem = (key, id, patch) => {
    patchBoard({
      [key]: board[key].map(it => it.id === id ? { ...it, ...patch } : it),
    });
  };
  const removeItem = (key, id) => {
    patchBoard({ [key]: board[key].filter(it => it.id !== id) });
  };
  const updateSingle = (key, patch) => {
    patchBoard({ [key]: { ...board[key], ...patch } });
  };
  const removeSingle = (key) => {
    patchBoard({ [key]: null });
  };

  /* ---- Adding ---- */
  const addSticky = (color = 'yellow') => {
    const id = 's' + Date.now();
    const sticky = {
      id, x: 400 + Math.random() * 200, y: 400 + Math.random() * 200,
      color, rot: (Math.random() - 0.5) * 6,
      text: 'double-click to edit', author: state.who,
    };
    patchBoard({ stickies: [...board.stickies, sticky] });
  };

  const addTag = () => {
    const label = prompt('Design element (e.g. "brass fixtures"):', '');
    if (!label) return;
    const colors = ['red', 'blue', 'green', 'yellow'];
    const id = 't' + Date.now();
    const tag = {
      id, x: 400 + Math.random() * 200, y: 400 + Math.random() * 200,
      color: colors[Math.floor(Math.random() * colors.length)], label,
    };
    patchBoard({ tags: [...board.tags, tag] });
  };

  const addPhoto = () => setPicker({ kind: 'photo' });

  /* Rescan the current room's uploads folder and add any photos that
     aren't already on the board. Doesn't touch existing photos (so
     user-moved/resized/captioned ones are preserved), doesn't touch
     anything else on the board. */
  const rescanPhotos = () => {
    const roomId = state.currentRoom;
    const folderPhotos = UPLOADS_BY_ROOM[roomId] || [];
    const existing = board.photos || [];
    // A photo "matches" a folder file if its uploadRef.filename matches,
    // OR (legacy) its src contains the filename.
    const hasFilename = (filename) =>
      existing.some(p =>
        (p.uploadRef && p.uploadRef.filename === filename) ||
        (p.src && p.src.includes(encodeURIComponent(filename))) ||
        (p.src && p.src.includes(filename))
      );
    const newOnes = folderPhotos
      .filter(fp => !hasFilename(fp.filename))
      .map((fp, i) => {
        const idx = existing.length + i;
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        return {
          id: `auto-${roomId}-${Date.now()}-${i}`,
          uploadRef: { room: roomId, filename: fp.filename },
          x: 260 + col * 360,
          y: 260 + row * 360,
          w: 300,
          h: 300,
          caption: '',
          src_note: '',
          rot: ((idx * 37) % 7) - 3,
        };
      });
    if (newOnes.length === 0) {
      alert('No new photos found in this room\'s folder.');
      return;
    }
    patchBoard({ photos: [...existing, ...newOnes] });
  };

  const addList = () => {
    const id = 'l' + Date.now();
    const list = {
      id, x: 500, y: 500,
      title: 'To-do', sub: 'new list',
      items: [{ text: 'first task', done: false }],
    };
    patchBoard({ stickies: board.stickies, lists: [...(board.lists || []), list] });
    // If no primary list exists, put it there instead
    if (!board.list) patchBoard({ list: list });
  };

  const pickImage = (srcOrKind, caption) => {
    const id = 'p' + Date.now();
    const base = {
      id, x: 400 + Math.random() * 200, y: 400 + Math.random() * 200,
      w: 280, h: 260,
      caption: caption || 'new inspiration',
      src_note: 'added ' + new Date().toLocaleDateString(),
      rot: (Math.random() - 0.5) * 4,
    };
    if (srcOrKind === 'placeholder') {
      patchBoard({ photos: [...board.photos, { ...base, kind: 'placeholder' }] });
    } else {
      patchBoard({ photos: [...board.photos, { ...base, src: srcOrKind }] });
    }
    setPicker(null);
  };

  /* ---- Drawing ---- */
  const drawingRef = useRef({ drawing: false, points: [] });
  const [livePath, setLivePath] = useState(null);

  const canvasRef = useRef(null);

  const onCanvasMouseDown = (e) => {
    if (tool === 'select') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === 'eraser') {
      // erase nearest stroke within 15px
      const hit = (board.strokes || []).find(s =>
        s.points.some(([px, py]) => Math.hypot(px - x, py - y) < 15)
      );
      if (hit) patchBoard({ strokes: board.strokes.filter(s => s.id !== hit.id) });
      return;
    }

    drawingRef.current = { drawing: true, points: [[x, y]] };
    setLivePath({ color: inkColor, tool, points: [[x, y]] });

    const move = (ev) => {
      if (!drawingRef.current.drawing) return;
      const mx = (ev.clientX - rect.left) / zoom;
      const my = (ev.clientY - rect.top) / zoom;
      drawingRef.current.points.push([mx, my]);
      setLivePath({ color: inkColor, tool, points: [...drawingRef.current.points] });
    };
    const up = () => {
      drawingRef.current.drawing = false;
      const id = 'dr' + Date.now();
      patchBoard({
        strokes: [...(board.strokes || []), {
          id, color: inkColor, tool, points: drawingRef.current.points,
        }],
      });
      setLivePath(null);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const clearDrawings = () => {
    if (!confirm('Erase all drawings on this sheet?')) return;
    patchBoard({ strokes: [] });
  };

  /* ---- Keyboard ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea, [contenteditable]')) return;
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'p' || e.key === 'P') setTool('pen');
      if (e.key === 'h' || e.key === 'H') setTool('highlight');
      if (e.key === 'e' || e.key === 'E') setTool('eraser');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- Zoom ---- */
  const zoomIn = () => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(2)));
  const zoomReset = () => setZoom(1);

  /* ---- Export + reset ---- */
  const resetBoard = () => {
    if (!confirm('Reset this room to its starter layout? All your notes here will be lost.')) return;
    setState(s => ({
      ...s,
      boards: {
        ...s.boards,
        [s.currentRoom]: { ...STARTER_BOARDS[s.currentRoom], strokes: [] },
      },
    }));
  };

  /* ---- Drawing SVG path helper ---- */
  const pointsToPath = (pts) => {
    if (!pts.length) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
    return d;
  };

  const strokeStyle = (s) => {
    const colorMap = {
      ink: 'var(--ink)', red: 'var(--ink-red)',
      blue: 'var(--ink-blue)', green: 'var(--ink-green)',
      yellow: 'var(--ink-highlight)',
    };
    const color = colorMap[s.color] || colorMap.ink;
    if (s.tool === 'highlight') {
      return { stroke: 'var(--ink-highlight)', strokeWidth: 18, opacity: 0.45, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    }
    return { stroke: color, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  };

  const paperToneStyles = {
    cream: { '--paper': '#F4EEDF', '--paper-edge': '#E8DFC7' },
    cool:  { '--paper': '#ECEFE6', '--paper-edge': '#D9DED2' },
    warm:  { '--paper': '#F5E6D0', '--paper-edge': '#E8D6B8' },
    white: { '--paper': '#FBF8F0', '--paper-edge': '#EFE9DB' },
  };
  const inkColorStyles = {
    indigo:   { '--ink': '#1D2B3E', '--ink-soft': '#3A4A63' },
    charcoal: { '--ink': '#222221', '--ink-soft': '#4A4A48' },
    sepia:    { '--ink': '#3A2414', '--ink-soft': '#5A3C28' },
  };
  const appStyle = {
    ...(paperToneStyles[tweaks.paperTone] || {}),
    ...(inkColorStyles[tweaks.inkColor] || {}),
  };

  const gridSize = { dense: '15px', standard: '20px', loose: '30px' }[tweaks.gridDensity] || '20px';

  /* ---- Authorship ---- */
  const [firstInitial, secondInitial] = (tweaks.authorInitials || 'M/W').split('/');

  return (
    <div className="app" style={appStyle} data-screen-label={`${currentRoom.num} ${currentRoom.name}`}>
      {/* Title block */}
      <div className="titleblock">
        <div className="project">
          <span className="label">Project №</span>
          <span className="name">HOUSE · INSPIRATION + DIY</span>
        </div>
        <div className="meta">
          <span><span style={{color:'#8a7f66'}}>Sheet</span><b>{currentRoom.sheet}</b></span>
          <span><span style={{color:'#8a7f66'}}>Scale</span><b>NTS</b></span>
          <span><span style={{color:'#8a7f66'}}>Date</span><b>{new Date().toISOString().slice(0,10)}</b></span>
          <span><span style={{color:'#8a7f66'}}>Room</span><b>{currentRoom.name}</b></span>
        </div>

        <div className="tools" title="Tools (V/P/H/E)">
          <button className={tool === 'select' ? 'active' : ''} onClick={() => setTool('select')} title="Select (V)">⤤</button>
          <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')} title="Pen (P)">✎</button>
          <button className={tool === 'highlight' ? 'active' : ''} onClick={() => setTool('highlight')} title="Highlighter (H)">▬</button>
          <button className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')} title="Eraser (E)">⌫</button>
          <div className="sep"></div>
          <div className="ink-swatches">
            {['ink','red','blue','green','yellow'].map(c => (
              <button
                key={c}
                className={inkColor === c ? 'active' : ''}
                style={{
                  background: c === 'ink' ? '#1D2B3E' : c === 'red' ? '#B8593F' :
                              c === 'blue' ? '#2F5D8A' : c === 'green' ? '#5C7048' : '#F2D65C'
                }}
                onClick={() => setInkColor(c)}
                title={c}
              />
            ))}
          </div>
          <div className="sep"></div>
          <button onClick={clearDrawings} title="Clear all ink on this sheet">✕ink</button>
          <button onClick={resetBoard} title="Reset this sheet to starter layout">⟲</button>
        </div>

        <div className="authorship">
          <button
            className={state.who === (firstInitial || 'M') ? 'who active' : 'who'}
            onClick={() => setState(s => ({ ...s, who: firstInitial || 'M' }))}
          >{firstInitial || 'M'}</button>
          <button
            className={state.who === (secondInitial || 'W') ? 'who active' : 'who'}
            onClick={() => setState(s => ({ ...s, who: secondInitial || 'W' }))}
          >{secondInitial || 'W'}</button>
        </div>
      </div>

      {/* Left tab rail */}
      <div className="tabrail">
        {ROOMS.map(r => (
          <button
            key={r.id}
            className={`tab ${state.currentRoom === r.id ? 'active' : ''}`}
            onClick={() => setState(s => ({ ...s, currentRoom: r.id }))}
          >
            <span className="num">{r.num} · {r.sheet}</span>
            {r.name}
          </button>
        ))}
      </div>

      {/* Board / paper */}
      <div className="board">
        <div
          className="canvas paper"
          ref={canvasRef}
          style={{
            transform: `scale(${zoom})`,
            backgroundSize: `100px 100px, 100px 100px, ${gridSize} ${gridSize}, ${gridSize} ${gridSize}`,
          }}
          onMouseDown={onCanvasMouseDown}
        >
          {/* Scope stamp */}
          {currentRoom.scope && (
            <div className={`scope-stamp scope-${currentRoom.scope}`}>
              {currentRoom.scope === 'pro'   ? 'WITH PRO' :
               currentRoom.scope === 'mixed' ? 'DIY + PRO' : 'DIY'}
              {currentRoom.pro && (
                <span className="pro-note">{currentRoom.pro}</span>
              )}
            </div>
          )}

          {/* Page title */}
          <div className="page-title">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateRoomMeta(currentRoom.id, { name: e.target.innerText })}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ outline: 'none' }}
            >{currentRoom.name}</span>
            <span className="underline"></span>
            <span className="sub">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateRoomMeta(currentRoom.id, { location: e.target.innerText })}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ outline: 'none' }}
              >{currentRoom.location}</span>
              {' · '}
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateRoomMeta(currentRoom.id, { subtitle: e.target.innerText })}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ outline: 'none' }}
              >{currentRoom.subtitle}</span>
            </span>
          </div>

          {/* Sheet index */}
          <div className="sheet-index">
            sheet<br/>
            <span className="big">{currentRoom.sheet}</span>
            {currentRoom.num} of {String(ROOMS.length).padStart(2, '0')}
          </div>

          {/* All pinnable items */}
          {board.photos && board.photos.map(p => (
            <PhotoPin key={p.id} item={p} zoom={zoom}
              onChange={(patch) => updateItem('photos', p.id, patch)}
              onDelete={() => removeItem('photos', p.id)}
            />
          ))}
          {board.stickies && board.stickies.map(s => (
            <StickyPin key={s.id} item={s} zoom={zoom} whoInitial={state.who}
              onChange={(patch) => updateItem('stickies', s.id, patch)}
              onDelete={() => removeItem('stickies', s.id)}
            />
          ))}
          {board.tags && board.tags.map(t => (
            <TagPin key={t.id} item={t} zoom={zoom}
              onChange={(patch) => updateItem('tags', t.id, patch)}
              onDelete={() => removeItem('tags', t.id)}
            />
          ))}
          {board.list && (
            <ListPad item={board.list} zoom={zoom}
              onChange={(patch) => updateSingle('list', patch)}
              onDelete={() => removeSingle('list')}
            />
          )}
          {board.timeline && (
            <TimelineCard item={board.timeline} zoom={zoom}
              onChange={(patch) => updateSingle('timeline', patch)}
              onDelete={() => removeSingle('timeline')}
            />
          )}
          {board.links && (
            <LinksCard item={board.links} zoom={zoom}
              onChange={(patch) => updateSingle('links', patch)}
              onDelete={() => removeSingle('links')}
            />
          )}
          {board.paint && (
            <PaintCard item={board.paint} zoom={zoom}
              onChange={(patch) => updateSingle('paint', patch)}
              onDelete={() => removeSingle('paint')}
            />
          )}

          {/* Drawing layer */}
          <div className={`drawlayer ${tool !== 'select' ? 'active' : ''}`}>
            <svg width="2400" height="1600" style={{ position: 'absolute', inset: 0 }}>
              {(board.strokes || []).map(s => (
                <path key={s.id} d={pointsToPath(s.points)} {...strokeStyle(s)} />
              ))}
              {livePath && (
                <path d={pointsToPath(livePath.points)} {...strokeStyle(livePath)} />
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Zoom control */}
      <div className="zoom-ctrl">
        <button onClick={zoomIn} title="Zoom in">+</button>
        <div className="lvl" onClick={zoomReset} style={{cursor:'pointer'}}>{Math.round(zoom*100)}%</div>
        <button onClick={zoomOut} title="Zoom out">−</button>
      </div>

      {/* Add menu */}
      <div className="addmenu">
        <button onClick={addPhoto}><span className="glyph">▢</span>Photo</button>
        <button onClick={rescanPhotos} title="Pull in any new images from this room's uploads folder"><span className="glyph">↻</span>Rescan</button>
        <button onClick={saveNow} title="Write current state to localStorage + snapshot slot">
          <span className="glyph">◇</span>
          {saveStatus === 'saving' ? 'saving…' : saveStatus === 'saved' ? 'saved ✓' : 'Save'}
        </button>
        <button onClick={() => addSticky('yellow')}><span className="glyph">✎</span>Note</button>
        <button onClick={addTag}><span className="glyph">◉</span>Tag</button>
        <button onClick={() => {
          if (board.list) return alert('There is already a to-do list on this sheet. Edit that one.');
          patchBoard({ list: {
            id: 'l' + Date.now(), x: 500, y: 500,
            title: 'To-do', sub: 'tasks',
            items: [{ text: 'first task', done: false }],
          }});
        }}><span className="glyph">☰</span>To-do</button>
        <button onClick={() => {
          if (board.timeline) return alert('There is already a timeline on this sheet.');
          patchBoard({ timeline: {
            id: 'tm' + Date.now(), x: 500, y: 500,
            title: 'Phase plan',
            phases: [
              { label: 'Phase 1', meta: 'date', status: 'todo' },
            ],
          }});
        }}><span className="glyph">▦</span>Timeline</button>
        <button onClick={() => {
          if (board.links) return alert('There is already a sourcing card on this sheet.');
          patchBoard({ links: {
            id: 'lk' + Date.now(), x: 500, y: 500,
            title: 'Sourcing',
            items: [],
          }});
        }}><span className="glyph">⛓</span>Links</button>
        <button onClick={() => {
          if (board.paint) return alert('There is already a paint palette on this sheet.');
          patchBoard({ paint: {
            id: 'pt' + Date.now(), x: 500, y: 500,
            title: 'Paint palette',
            chips: [
              { name: "Cook's Blue", vendor: 'Farrow & Ball', hex: '#4A6F8A', use: 'tap to edit', code: 'No. 237' },
            ],
          }});
        }}><span className="glyph">▣</span>Paint</button>
      </div>

      {/* Photo picker modal */}
      {picker && picker.kind === 'photo' && (
        <div className="modal-back" onClick={() => setPicker(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add inspiration photo</h3>
            <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-soft)',marginTop:0}}>Pick from uploaded, use a URL, or drop a placeholder</p>
            <div className="opts">
              {UPLOADED_IMAGES.map((src, i) => (
                <button key={i} className="opt" style={{padding:6,background:'#fff',borderStyle:'solid'}} onClick={() => pickImage(src, 'from your uploads')}>
                  <img src={src} style={{width:'100%',height:120,objectFit:'cover',display:'block'}} />
                </button>
              ))}
              <button className="opt" onClick={() => {
                const url = prompt('Image URL:', 'https://');
                if (url) pickImage(url, 'from web');
              }}>+ From URL</button>
              <button className="opt" onClick={() => pickImage('placeholder', 'to find')}>+ Placeholder</button>
            </div>
            <div className="row">
              <button className="cancel" onClick={() => setPicker(null)}>cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tweaks */}
      <div className={`tweaks ${tweaksOn ? 'on' : ''}`}>
        <h4>Tweaks</h4>
        <div className="tweak">
          <label>Paper tone</label>
          <div className="tweak-row">
            {['cream','warm','cool','white'].map(t => (
              <button key={t} className={tweaks.paperTone === t ? 'active' : ''}
                onClick={() => setTweak('paperTone', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Ink color</label>
          <div className="tweak-row">
            {['indigo','charcoal','sepia'].map(t => (
              <button key={t} className={tweaks.inkColor === t ? 'active' : ''}
                onClick={() => setTweak('inkColor', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Grid density</label>
          <div className="tweak-row">
            {['dense','standard','loose'].map(t => (
              <button key={t} className={tweaks.gridDensity === t ? 'active' : ''}
                onClick={() => setTweak('gridDensity', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Author initials (who/who)</label>
          <input
            type="text"
            defaultValue={tweaks.authorInitials}
            style={{ width: '100%', padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, border: '1px solid var(--ink)', background: 'transparent' }}
            onBlur={(e) => setTweak('authorInitials', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
