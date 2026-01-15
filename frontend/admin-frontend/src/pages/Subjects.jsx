import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/Subjects.css";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/subjects");
      setSubjects(res.data);
    } catch {
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      if (editingId) {
        await API.put(`/admin/subjects/${editingId}`, { subjectName });
      } else {
        await API.post("/admin/subjects", { subjectName });
      }

      setSubjectName("");
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

const handleEdit = (subject) => {
    setEditingId(subject._id);
    setSubjectName(subject.subjectName);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await API.delete(`/admin/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div className="subjects-container">
      <h2>Subjects</h2>

      {error && <div className="error">{error}</div>}

      <form className="subject-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />

        <button className="btn-primary" type="submit">
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setSubjectName("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <ul className="subject-list">
          {subjects.map((subject) => (
            <li className="subject-item" key={subject._id}>
              <span className="subject-name">{subject.subjectName}</span>

              <div className="subject-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(subject)}
                >
                  Edit
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(subject._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
