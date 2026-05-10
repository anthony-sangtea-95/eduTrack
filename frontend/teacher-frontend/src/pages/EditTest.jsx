import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/CreateTest.css";
import { useNavigate, useParams } from "react-router-dom";
import { showSuccess, showError } from "../../../utils/utils";

export default function EditTest() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => { 
    try {
      const [testRes, studentsRes, subjectsRes] = await Promise.all([
        API.get(`/teacher/tests/${testId}`),
        API.get("/teacher/tests/students"),
        API.get("/teacher/subjects")
      ]);

      const test = testRes.data;

      setTitle(test.title);
      setDescription(test.description || "");
      setDueDate(
        test.dueDate
          ? new Date(test.dueDate).toISOString().split("T")[0]
          : ""
      );
      setSelectedSubject(test.subject?._id || "");
      setDurationMinutes(test.durationMinutes || "");

      setSelectedStudents(
        test.assignedStudents?.map(s => s._id) || []
      );

      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);

    } catch (err) {
      setError("Failed to load test data");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const submitHandler = async () => {
    try {
      setSaving(true);

      const { data } = await API.put(`/teacher/tests/${testId}`, {
        title,
        description,
        dueDate,
        durationMinutes: Number(durationMinutes),
        subject: selectedSubject,
        assignedStudents: selectedStudents
      });

      if(data.success){
        showSuccess("Test updated successfully");
        navigate("/tests");
      }
    } catch (err) {
      showError("Failed to update test");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{textAlign:"center"}}>Loading...</p>;

  return (
    <div className="main">
      <div className="create-test-container">

        <button className="test-back" onClick={() => navigate("/tests")}>
          ← Back
        </button>

        <div className="create-test-card">
          <h2>Edit Test</h2>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />


          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <label>Duration (minutes)</label>
          <input
            type="number"
            min="1"
            placeholder="Enter duration in minutes"
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
          />

          <label>Subjects</label>
          <div className="subject-grid">
            {subjects.map(subject => (
              <div
                key={subject._id}
                className={`subject-card ${
                  selectedSubject === subject._id ? "active" : ""
                }`}
                onClick={() => setSelectedSubject(subject._id)}
              >
                <p>{subject.subjectName}</p>
              </div>
            ))}
          </div>

          <label>Assign Students</label>
          <div className="students-list">
            {students.map(s => (
              <div
                key={s._id}
                className={`student-item ${
                  selectedStudents.includes(s._id) ? "selected" : ""
                }`}
                onClick={() => toggleStudent(s._id)}
              >
                {s.name}
              </div>
            ))}
          </div>

          <button onClick={submitHandler} disabled={saving}>
            {saving ? "Updating..." : "Update Test"}
          </button>
        </div>
      </div>
    </div>
  );
}