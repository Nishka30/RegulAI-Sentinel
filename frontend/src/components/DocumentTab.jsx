import { useState, useRef, useEffect } from 'react';
import { FiFileText, FiUpload, FiEdit2, FiCopy, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const R = 4; // global squarish radius

export default function DocumentTab({ doc, onDelete, onUpdate, isOnly }) {
  const [editing, setEditing]   = useState(false);
  const [nameVal, setNameVal]   = useState(doc.name);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied]     = useState(false);
  const fileRef = useRef();

  useEffect(() => { if (!editing) setNameVal(doc.name); }, [doc.name, editing]);

  const wordCount = doc.text.trim() ? doc.text.trim().split(/\s+/).length : 0;
  const charCount = doc.text.length;

  const commitName = () => {
    setEditing(false);
    const v = nameVal.trim();
    if (v) onUpdate(doc.id, { name: v });
    else setNameVal(doc.name);
  };

  const handleTextBlur = (e) => {
    e.target.style.borderColor = 'var(--border)';
    if (doc.text.trim() && /^Document \d+$/.test(doc.name)) {
      const first = doc.text.trim().split('\n')[0].trim().slice(0, 32);
      if (first) onUpdate(doc.id, { name: first });
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(doc.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const extractPdf = async (file) => {
    if (!file || file.type !== 'application/pdf') return;
    const cleanName = file.name.replace(/\.pdf$/i, '');
    onUpdate(doc.id, { name: cleanName, pdfFile: file, pdfFileName: file.name, pdfUrl: URL.createObjectURL(file), extracting: true, extracted: false });
    try {
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const ct = await pg.getTextContent();
        text += ct.items.map(x => x.str).join(' ') + '\n';
      }
      onUpdate(doc.id, { text: text.trim(), extracting: false, extracted: true });
    } catch (e) {
      console.error(e);
      onUpdate(doc.id, { extracting: false, pdfFile: null, pdfUrl: null, pdfFileName: '' });
    }
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); extractPdf(e.dataTransfer.files[0]); };

  const btn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: R, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.18s ease',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    boxShadow: active ? '0 2px 12px var(--accent-glow)' : 'none',
    fontFamily: 'inherit',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {editing ? (
            <input
              autoFocus value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setEditing(false); setNameVal(doc.name); } }}
              style={{ background: 'var(--surface2)', color: 'var(--text-primary)', border: '1.5px solid var(--accent)', borderRadius: R, padding: '5px 10px', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
            />
          ) : (
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px', fontFamily: 'inherit' }}>
              <span>{doc.name}</span>
              <FiEdit2 size={12} color="var(--text-muted)" />
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>click to rename</span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: R, padding: 3 }}>
          <button style={btn(doc.mode === 'text')} onClick={() => onUpdate(doc.id, { mode: 'text' })}>
            <FiFileText size={13} /> Paste Text
          </button>
          <button style={btn(doc.mode === 'pdf')} onClick={() => onUpdate(doc.id, { mode: 'pdf' })}>
            <FiUpload size={13} /> Upload PDF
          </button>
        </div>
      </div>

      {/* Content */}
      {doc.mode === 'text' ? (
        <div>
          <textarea
            value={doc.text}
            onChange={e => onUpdate(doc.id, { text: e.target.value })}
            placeholder="Paste your compliance document text here…"
            style={{ width: '100%', minHeight: 220, resize: 'none', background: 'var(--surface2)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', borderRadius: R, padding: 16, fontSize: 13.5, lineHeight: 1.7, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={handleTextBlur}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, padding: '0 2px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {doc.text.trim() ? `${wordCount} words · ${charCount} characters` : 'Start typing or paste document content'}
            </span>
            {doc.text.trim() && (
              <button onClick={copyText} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: copied ? 'var(--green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s', fontFamily: 'inherit' }}>
                {copied ? <><FiCheck size={11} /> Copied!</> : <><FiCopy size={11} /> Copy text</>}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => extractPdf(e.target.files[0])} />

          {!doc.pdfUrl ? (
            <div
              className={`drop-zone${dragging ? ' dragging' : ''}`}
              style={{ height: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <div style={{ width: 52, height: 52, borderRadius: R, background: dragging ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                <FiUpload size={22} color={dragging ? '#fff' : 'var(--text-muted)'} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Drop PDF here</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>click to browse</span> · Text extracted via PDF.js</p>
              </div>
            </div>
          ) : (
            <div style={{ border: '1.5px solid var(--border)', borderRadius: R, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: R, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiFileText size={14} color="var(--red)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.pdfFileName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {doc.extracting && (
                        <span style={{ fontSize: 11, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--amber)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
                          Extracting text…
                        </span>
                      )}
                      {doc.extracted && !doc.extracting && (
                        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCheck size={11} /> Text extracted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { onUpdate(doc.id, { pdfFile: null, pdfUrl: null, pdfFileName: '', extracted: false }); fileRef.current.value = ''; }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <FiX size={13} /> Remove
                </button>
              </div>
              <iframe src={doc.pdfUrl} style={{ width: '100%', height: 300, background: 'var(--surface2)', display: 'block', border: 'none' }} title="PDF Preview" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
