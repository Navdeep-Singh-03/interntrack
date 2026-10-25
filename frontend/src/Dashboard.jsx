import { useEffect, useState } from "react";
import { createApplication, deleteApplication, getApplications, updateApplication } from "./api";
import ApplicationForm, { STATUSES } from "./ApplicationForm";
import JobFitAssistant from "./JobFitAssistant";

const statisticStatuses = ["Applied", "OA", "Interview", "Offer", "Rejected"];
export default function Dashboard({ user, onLogout }) {
  const [applications, setApplications] = useState([]); const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const [editingApplication, setEditingApplication] = useState(null); const [loading, setLoading] = useState(true); const [slowLoading, setSlowLoading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  async function loadApplications() {
    setLoading(true); setSlowLoading(false);
    // Free hosting can need a short time to wake up after inactivity.
    const slowLoadingTimer = setTimeout(() => setSlowLoading(true), 3500);
    try { setApplications(await getApplications(search, status)); }
    catch (err) { setError(err.message); }
    finally { clearTimeout(slowLoadingTimer); setSlowLoading(false); setLoading(false); }
  }
  useEffect(() => { const timeout = setTimeout(loadApplications, 250); return () => clearTimeout(timeout); }, [search, status]);
  async function saveApplication(data) { setSaving(true); setError(""); try { editingApplication ? await updateApplication(editingApplication.id, data) : await createApplication(data); setEditingApplication(null); setMessage("Application saved successfully."); await loadApplications(); } catch (err) { setError(err.message); } finally { setSaving(false); } }
  async function removeApplication(id) { if (!window.confirm("Delete this application?")) return; try { await deleteApplication(id); setMessage("Application deleted successfully."); await loadApplications(); } catch (err) { setError(err.message); } }
  function logout() { localStorage.removeItem("interntrack_token"); localStorage.removeItem("interntrack_user"); onLogout(); }
  const count = (target) => applications.filter((application) => application.status === target).length;
  return <main className="app"><header><div><p className="eyebrow">InternTrack</p><h1>Your internship search, organized.</h1><p className="subtext">Welcome back, {user.name}.</p></div><button className="secondary" onClick={logout}>Log out</button></header>
    <section className="stats"><article><span>Total</span><strong>{applications.length}</strong></article>{statisticStatuses.map((item) => <article key={item}><span>{item}</span><strong>{count(item)}</strong></article>)}</section>
    <div className="content"><ApplicationForm editingApplication={editingApplication} onSave={saveApplication} onCancel={() => setEditingApplication(null)} saving={saving} />
      <section className="list-card"><div className="section-title"><div><p className="eyebrow">Your applications</p><h2>Application list</h2></div></div>
        <div className="filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company or role" /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>
        {error && <div className="alert error">{error} <button className="retry-button" onClick={loadApplications}>Retry</button></div>}{message && <p className="alert success">{message}</p>}
        {loading ? <div className="empty"><p>{slowLoading ? "Starting the demo server..." : "Loading applications..."}</p>{slowLoading && <small>This free demo may take up to one minute on its first visit.</small>}</div> : applications.length === 0 ? <p className="empty">No applications found. Add one with the form.</p> : <div className="table-wrap"><table><thead><tr><th>Company / Role</th><th>Status</th><th>Location</th><th>Applied</th><th></th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td><strong>{item.company}</strong><br /><span>{item.role}</span></td><td><span className="status">{item.status}</span></td><td>{item.location}</td><td>{item.application_date}</td><td className="actions"><button onClick={() => { setEditingApplication(item); setMessage(""); }}>Edit</button><button className="danger" onClick={() => removeApplication(item.id)}>Delete</button></td></tr>)}</tbody></table></div>}
      </section></div>
    <JobFitAssistant />
  </main>;
}
