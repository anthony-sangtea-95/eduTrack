import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/Subjects.css";
import {showSuccess, showError} from "../../../utils/utils";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/subjects");
      setSubjects(res.data);
    } catch {
      showError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      let res = null;
      if (editingId) {
        res = await API.put(`/admin/subjects/${editingId}`, { subjectName });
      } else {
        res = await API.post("/admin/subjects", { subjectName });
      }
      if (res.status === 201 || res.status === 200) {
        showSuccess(editingId ? "Subject updated" : "Subject created");
      }
      setSubjectName("");
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      showError(editingId ? "Update failed : " + (err.response?.data?.message || "") : "Creation failed : " + (err.response?.data?.message || ""));
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
      fetchSubjects();
    } catch (err) {
      showError("Delete failed : " + (err.response?.data?.message || ""));
    }
  };

  return (
    <div className="subjects-container">
      <h2>Subjects</h2>
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
