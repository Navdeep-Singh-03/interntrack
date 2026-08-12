import { useEffect, useState } from "react";

export const STATUSES = ["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"];
const emptyForm = { company: "", role: "", status: "Wishlist", location: "", application_date: new Date().toISOString().slice(0, 10), deadline: "", notes: "" };

export default function ApplicationForm({ editingApplication, onSave, onCancel, saving }) {
  const [form, setForm] = useState(emptyForm);
  useEffect(() => { setForm(editingApplication ? { ...editingApplication, deadline: editingApplication.deadline || "", notes: editingApplication.notes || "" } : emptyForm); }, [editingApplication]);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  function submit(event) { event.preventDefault(); onSave({ ...form, deadline: form.deadline || null, notes: form.notes || null }); }
  return <section className="form-card"><div className="section-title"><div><p className="eyebrow">{editingApplication ? "Update" : "New application"}</p><h2>{editingApplication ? "Edit application" : "Add application"}</h2></div></div>
    <form onSubmit={submit} className="application-form">
      <label>Company</label><input name="company" value={form.company} onChange={change} required />
      <label>Role</label><input name="role" value={form.role} onChange={change} required />
      <label>Status</label><select name="status" value={form.status} onChange={change}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
      <label>Location</label><input name="location" value={form.location} onChange={change} placeholder="e.g. Bengaluru / Remote" required />
      <label>Application date</label><input type="date" name="application_date" value={form.application_date} onChange={change} required />
      <label>Deadline <span>(optional)</span></label><input type="date" name="deadline" value={form.deadline} onChange={change} />
      <label>Notes <span>(optional)</span></label><textarea name="notes" value={form.notes} onChange={change} rows="3" />
      <div className="form-actions"><button className="primary" disabled={saving}>{saving ? "Saving..." : editingApplication ? "Save changes" : "Add application"}</button>{editingApplication && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}</div>
    </form>
  </section>;
}
