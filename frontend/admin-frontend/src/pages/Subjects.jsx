import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/Subjects.css";
import {showSuccess, showError} from "../../../utils/utils";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await API.get("/admin/subjects");
      setSubjects(res.data);
    } catch {
      setLoadError(true);
      showError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      setSaving(true);
      let res = null;
      if (editingId) {
        res = await API.put(`/admin/subjects/${editingId}`, { subjectName: subjectName.trim() });
      } else {
        res = await API.post("/admin/subjects", { subjectName: subjectName.trim() });
      }
      if (res.status === 201 || res.status === 200) {
        showSuccess(editingId ? "Subject updated" : "Subject created");
      }
      setSubjectName("");
      setEditingId(null);
      await fetchSubjects();
    } catch (err) {
      showError(editingId ? "Update failed : " + (err.response?.data?.message || "") : "Creation failed : " + (err.response?.data?.message || ""));
    } finally {
      setSaving(false);
    }
  };

const handleEdit = (subject) => {
    setEditingId(subject._id);
    setSubjectName(subject.subjectName);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      const res = await API.delete(`/admin/subjects/${id}`);
      if (res.status === 200) {
        showSuccess(res.data.message);
      } else {
        if (res.status === 404) {
          showError(res.data.message);
        }
      }
      await fetchSubjects();
    } catch (err) {
      showError("Delete failed : " + (err.response?.data?.message || ""));
    }
  };

  return (
    <main className="main">
      <div className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Learning catalog</p>
            <h1>Manage subjects</h1>
            <p>Keep the subject catalog organized for teachers and students.</p>
          </div>
          {!loading && !loadError && (
            <div className="admin-count-card">
              <strong>{subjects.length}</strong>
              <span>{subjects.length === 1 ? "subject" : "subjects"}</span>
            </div>
          )}
        </header>

        <section className="admin-data-card subjects-card">
          <div className="admin-data-toolbar">
            <div>
              <h2>{editingId ? "Update a subject" : "Add a subject"}</h2>
              <p>{editingId ? "Change the subject name or cancel to keep the current one." : "Add a subject to make it available in the catalog."}</p>
            </div>
          </div>
          <form className="subject-form" onSubmit={handleSubmit}>
            <label className="subject-input-group">
              <span>Subject name</span>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                maxLength={100}
              />
            </label>
            <div className="subject-form-actions">
              <button className="button" type="submit" disabled={saving || !subjectName.trim()}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add subject"}
              </button>
              {editingId && (
                <button
                  className="subject-cancel-button"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditingId(null);
                    setSubjectName("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-data-card subjects-card">
          <div className="admin-data-toolbar">
            <div>
              <h2>Subject catalog</h2>
              <p>{loading ? "Loading subjects…" : `${subjects.length} ${subjects.length === 1 ? "subject" : "subjects"} in the catalog`}</p>
            </div>
          </div>
          {loadError ? (
            <div className="admin-state-card admin-error-card" role="alert">
              <span className="admin-state-icon" aria-hidden="true">!</span>
              <div>
                <h2>Subjects are unavailable</h2>
                <p>We could not load the catalog. Please try again.</p>
              </div>
              <button className="button" type="button" onClick={fetchSubjects}>Try again</button>
            </div>
          ) : loading ? (
            <div className="admin-loading-list" aria-label="Loading subjects">
              {[0, 1, 2].map(item => <div className="admin-user-skeleton" key={item} />)}
            </div>
          ) : subjects.length === 0 ? (
            <div className="admin-empty-state">
              <span className="admin-state-icon" aria-hidden="true">+</span>
              <div>
                <h2>Your catalog is empty</h2>
                <p>Add the first subject using the form above.</p>
              </div>
            </div>
          ) : (
            <ul className="subject-list">
              {subjects.map((subject) => (
                <li className="subject-item" key={subject._id}>
                  <div className="subject-title">
                    <span aria-hidden="true">S</span>
                    <strong>{subject.subjectName}</strong>
                  </div>
                  <div className="subject-actions">
                    <button className="btn-edit" type="button" onClick={() => handleEdit(subject)}>Edit</button>
                    <button className="btn-delete" type="button" onClick={() => handleDelete(subject._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
