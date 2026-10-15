
import { useState } from "react";
import "./App.css";

export default function App() {
  const [api] = useState("http://localhost:5001/api");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("cloudmesh-test@example.com");
  const [password, setPassword] = useState("CloudMeshTest123!");
  const [files, setFiles] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    try {
      const res = await fetch(`${api}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");
      setToken(json.data.token);
      setMessage("Connected successfully");
      await loadFiles(json.data.token);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadFiles(currentToken = token) {
    try {
      const res = await fetch(`${api}/files/`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not load files");
      setFiles(json.data || []);
      setMessage(`${json.count ?? json.data.length} files loaded`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load files");
    }
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${api}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setMessage(`Uploaded ${file.name}`);
      await loadFiles();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function downloadFile(file: any) {
    try {
      const res = await fetch(`${api}/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      link.click();
      URL.revokeObjectURL(url);
      setMessage(`Downloaded ${file.originalName}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Download failed");
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">C</span> CloudMesh</div>
        <p className="side-label">WORKSPACE</p>
        <div className="side-active">▦ &nbsp; My Files</div>
        <div className="side-item">◈ &nbsp; Storage Nodes</div>
        <div className="side-item">⚙ &nbsp; Settings</div>
        <div className="node-status"><span /> Node 1 online<br /><small>localhost:6001</small></div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div><span className="eyebrow">PERSONAL CLOUD</span><h1>My Files</h1></div>
          <div className="top-status"><span /> System operational</div>
        </header>

        {!token ? (
          <section className="login-card">
            <div className="hero-symbol">C</div>
            <h2>Your files. Your cloud.</h2>
            <p>Sign in to access your CloudMesh storage.</p>
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
            <button disabled={busy} onClick={login}>{busy ? "Connecting..." : "Sign in to CloudMesh →"}</button>
            <small>Local development · Gateway port 5001</small>
          </section>
        ) : (
          <>
            <section className="welcome-row">
              <div><h2>Your storage, organized.</h2><p>Upload and retrieve your files from your private cloud.</p></div>
              <label className="upload-button">＋ Upload file<input type="file" onChange={uploadFile} disabled={busy} /></label>
            </section>
            <section className="stats-grid">
              <div className="stat-card"><span>Total files</span><strong>{files.length}</strong><small>In your workspace</small></div>
              <div className="stat-card"><span>Storage node</span><strong className="green-text">Online</strong><small>Node 1 · localhost:6001</small></div>
              <div className="stat-card"><span>Storage model</span><strong>Chunked</strong><small>1 MB chunk target</small></div>
            </section>
            <section className="files-card">
              <div className="files-heading"><div><h2>Recent files</h2><p>Your uploaded documents</p></div><button className="secondary-button" onClick={() => loadFiles()}>↻ Refresh</button></div>
              {files.length === 0 ? <div className="empty-state">No files yet. Upload your first file above.</div> : files.map(file => (
                <div className="file-row" key={file.id}>
                  <div className="file-icon">▤</div>
                  <div className="file-info"><strong>{file.originalName}</strong><small>{file.mimeType} · {file.size} bytes · {file.chunks} chunk(s)</small></div>
                  <button className="secondary-button" onClick={() => downloadFile(file)}>↓ Download</button>
                </div>
              ))}
            </section>
          </>
        )}
        {message && <div className="notice">{message}</div>}
        <footer>CloudMesh · Distributed storage workspace <button onClick={() => { setToken(""); setFiles([]); setMessage("Signed out"); }}>Sign out</button></footer>
      </section>
    </main>
  );
}
