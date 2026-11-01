import { useCallback, useEffect, useState } from "react";
import Seo from "../components/Seo.jsx";
import { RESOURCES } from "../resources.js";
import * as api from "../api.js";
import { SEO } from "../seoData.js";

const blankFor = (cfg) =>
  Object.fromEntries(
    cfg.fields.map((f) => [f.name, f.type === "select" ? f.options[0][0] : f.type === "color" ? "#ff8a1f" : ""])
  );

function toForm(cfg, item) {
  const v = blankFor(cfg);
  for (const f of cfg.fields) {
    const raw = item[f.name];
    if (raw === undefined || raw === null) continue;
    v[f.name] = f.type === "date" ? String(raw).slice(0, 10) : String(raw);
  }
  return v;
}

function toBody(cfg, values) {
  const body = {};
  for (const f of cfg.fields) {
    const v = values[f.name];
    if (f.type === "number") {
      if (v !== "" && v !== undefined) body[f.name] = Number(v);
    } else if (f.type === "date") {
      if (v) body[f.name] = v;
    } else {
      body[f.name] = v;
    }
  }
  return body;
}

function Manager({ resource, adminKey }) {
  const cfg = RESOURCES[resource];
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(() => blankFor(cfg));
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.list(resource).then(setItems).catch((e) => setMsg({ bad: true, text: e.message }));
  }, [resource]);

  useEffect(() => {
    setValues(blankFor(cfg));
    setEditingId(null);
    setMsg(null);
    load();
  }, [resource, cfg, load]);

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = toBody(cfg, values);
      if (editingId) await api.update(resource, editingId, body, adminKey);
      else await api.create(resource, body, adminKey);
      setMsg({ text: editingId ? "Saved changes." : "Added." });
      setValues(blankFor(cfg));
      setEditingId(null);
      load();
    } catch (err) {
      setMsg({ bad: true, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function del(item) {
    if (!window.confirm(`Delete "${cfg.title(item)}"? This cannot be undone.`)) return;
    try {
      await api.remove(resource, item._id, adminKey);
      if (editingId === item._id) {
        setEditingId(null);
        setValues(blankFor(cfg));
      }
      load();
    } catch (err) {
      setMsg({ bad: true, text: err.message });
    }
  }

  return (
    <>
      <div className="panel">
        <h3>{editingId ? "Edit entry" : "Add new"}</h3>
        {msg && <div className={`msg ${msg.bad ? "bad" : "ok"}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          {cfg.fields.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={`f-${f.name}`}>{f.label}{f.required ? " *" : ""}</label>
              {f.type === "textarea" ? (
                <textarea id={`f-${f.name}`} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "select" ? (
                <select id={`f-${f.name}`} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {f.options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
                </select>
              ) : (
                <input
                  id={`f-${f.name}`}
                  type={f.type || "text"}
                  required={f.required}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.hint && <span className="hint">{f.hint}</span>}
            </div>
          ))}
          <div className="btn-row">
            <button className="btn primary" type="submit" disabled={busy}>{editingId ? "Save changes" : "Add"}</button>
            {editingId && (
              <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setValues(blankFor(cfg)); }}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <h3>Existing ({items.length})</h3>
        {items.length === 0 && <p className="hint">Nothing here yet.</p>}
        {items.map((item) => (
          <div className="listrow" key={item._id}>
            <span>{cfg.title(item)}</span>
            <span className="btn-row">
              <button className="btn ghost small" type="button" onClick={() => { setEditingId(item._id); setValues(toForm(cfg, item)); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn danger small" type="button" onClick={() => del(item)}>Delete</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Admin() {
  const [keyInput, setKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("adminKey") || "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(Boolean(sessionStorage.getItem("adminKey")));
  const [error, setError] = useState("");
  const [resource, setResource] = useState("episodes");

  const tryKey = useCallback(async (key) => {
    setChecking(true);
    setError("");
    try {
      await api.verifyKey(key);
      sessionStorage.setItem("adminKey", key);
      setAdminKey(key);
      setAuthed(true);
    } catch (e) {
      sessionStorage.removeItem("adminKey");
      setAuthed(false);
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) tryKey(adminKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    sessionStorage.removeItem("adminKey");
    setAdminKey("");
    setAuthed(false);
    setKeyInput("");
  }

  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.admin} />
      <div className="wrap admin">
        <h2>Admin</h2>

        {!authed && (
          <div className="panel">
            <p className="lead" style={{ marginTop: 0 }}>Enter the admin key to add or edit site content.</p>
            {error && <div className="msg bad">{error}</div>}
            <form onSubmit={(e) => { e.preventDefault(); tryKey(keyInput); }}>
              <div className="field">
                <label htmlFor="adminKey">Admin key</label>
                <input id="adminKey" type="password" autoComplete="current-password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} required />
              </div>
              <button className="btn primary" type="submit" disabled={checking}>{checking ? "Checking…" : "Log in"}</button>
            </form>
          </div>
        )}

        {authed && (
          <>
            <div className="tools">
              <div className="tabs" role="group" aria-label="Choose a section">
                {Object.entries(RESOURCES).map(([key, cfg]) => (
                  <button key={key} type="button" className={resource === key ? "on" : ""} onClick={() => setResource(key)}>
                    {cfg.label}
                  </button>
                ))}
              </div>
              <button className="btn ghost small" type="button" onClick={logout}>Log out</button>
            </div>
            <Manager key={resource} resource={resource} adminKey={adminKey} />
          </>
        )}
      </div>
    </section>
  );
}
