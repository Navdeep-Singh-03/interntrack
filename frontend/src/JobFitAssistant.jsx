import { useEffect, useState } from "react";
import { createProfileNote, deleteProfileNote, getJobFit, getProfileNotes } from "./api";

export default function JobFitAssistant() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("Resume / profile");
  const [noteContent, setNoteContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function loadNotes() {
    try { setNotes(await getProfileNotes()); }
    catch (err) { setError(err.message); }
  }

  useEffect(() => { loadNotes(); }, []);

  async function saveNote(event) {
    event.preventDefault();
    setSavingNote(true); setError("");
    try {
      await createProfileNote({ title, content: noteContent });
      setNoteContent("");
      await loadNotes();
    } catch (err) { setError(err.message); }
    finally { setSavingNote(false); }
  }

  async function analyze(event) {
    event.preventDefault();
    setAnalyzing(true); setError(""); setResult(null);
    try { setResult(await getJobFit(jobDescription)); }
    catch (err) { setError(err.message); }
    finally { setAnalyzing(false); }
  }

  async function removeNote(id) {
    try { await deleteProfileNote(id); await loadNotes(); }
    catch (err) { setError(err.message); }
  }

  return <section className="job-fit-card">
    <div className="section-title"><div><p className="eyebrow">Simple RAG</p><h2>AI Job-Fit Assistant</h2></div></div>
    <p className="job-fit-intro">Save your resume or profile notes, paste a job description, and get suggestions based only on your most relevant notes.</p>
    {error && <p className="alert error">{error}</p>}

    <div className="job-fit-grid">
      <div>
        <h3>1. Save profile notes</h3>
        <form onSubmit={saveNote}>
          <label>Note title</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Resume, project, skills" required />
          <label>Resume or profile text</label>
          <textarea value={noteContent} onChange={(event) => setNoteContent(event.target.value)} rows="7" minLength="20" placeholder="Paste skills, projects, experience, and achievements here..." required />
          <button className="primary compact-button" disabled={savingNote}>{savingNote ? "Saving..." : "Save note"}</button>
        </form>
        <div className="note-list">
          {notes.length === 0 ? <p className="small-text">No notes saved yet.</p> : notes.map((note) => <div className="note-item" key={note.id}><div><strong>{note.title}</strong><span>{note.content.slice(0, 90)}{note.content.length > 90 ? "..." : ""}</span></div><button className="text-danger" onClick={() => removeNote(note.id)}>Remove</button></div>)}
        </div>
      </div>

      <div>
        <h3>2. Analyze a job</h3>
        <form onSubmit={analyze}>
          <label>Job description</label>
          <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows="10" minLength="50" placeholder="Paste the internship job description here..." required />
          <button className="primary compact-button" disabled={analyzing || notes.length === 0}>{analyzing ? "Analyzing..." : "Analyze fit"}</button>
        </form>
        {notes.length === 0 && <p className="small-text">Save a profile note before analyzing.</p>}
      </div>
    </div>

    {result && <div className="job-fit-result">
      <div className="score"><span>Match score</span><strong>{result.match_score}%</strong></div>
      <div><p>{result.summary}</p><p className="small-text">Relevant notes used: {result.retrieved_note_titles.join(", ")}</p></div>
      <ResultList title="Strengths" items={result.strengths} />
      <ResultList title="Missing or unclear" items={result.missing_skills} />
      <ResultList title="Next improvements" items={result.suggestions} />
    </div>}
  </section>;
}

function ResultList({ title, items }) {
  return <div className="result-list"><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></div>;
}
