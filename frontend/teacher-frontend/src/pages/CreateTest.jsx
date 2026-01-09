import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/CreateTest.css";
import { useNavigate } from "react-router-dom";

export default function CreateTest() {
const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [selectedTestType, setSelectedTestType] = useState("");

  useEffect(() => {
    API.get("/teacher/tests/students").then(res => setStudents(res.data)).catch(err => console.error(err));
    API.get("/teacher/test-types").then(res => setTestTypes(res.data)).catch(err => console.error(err));
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const submitHandler = async () => {
    await API.post("/teacher/tests", {
      title,
      description,
      dueDate,
      testType: selectedTestType,
      assignedStudents: selectedStudents
    });
    alert("Test created successfully");
    navigate("/tests");
  };

  return (
      <div className="main">
      <div className="create-test-container">
        <button className="back-btn" onClick={() => navigate("/tests")}>
        ← Back
      </button>
      <div className="create-test-card">
        <h2>Create New Test</h2>

        <label>Title</label>
        <input
          type="text"
          placeholder="Enter test title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label>Description</label>
        <textarea
          placeholder="Describe the test"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <label>Test Type</label>
        <div className="test-type-grid">
          {testTypes.map(type => (
            <div
              key={type._id}
              className={`test-type-card ${
                selectedTestType === type._id ? "active" : ""
              }`}
              onClick={() => setSelectedTestType(type._id)}
            >
              <p>{type.typeName}</p>
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

        <button onClick={submitHandler}>Create Test</button>
      </div>
    </div>
     </div>
  );
}
