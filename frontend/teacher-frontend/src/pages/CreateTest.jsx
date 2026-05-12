import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/CreateTest.css";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../../utils/utils";

export default function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // New fields from updated Test schema
  const [isPublished, setIsPublished] = useState(false);
  const [status, setStatus] = useState('draft'); // draft | published | closed
  const [startTime, setStartTime] = useState(''); // ISO datetime-local string
  const [allowRetake, setAllowRetake] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);

  useEffect(() => {
    API.get("/teacher/tests/students").then(res => setStudents(res.data)).catch(err => console.error(err));
    API.get("/teacher/subjects").then(res => setSubjects(res.data)).catch(err => console.error(err));
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handleChangeStatus = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);  
    if (newStatus === 'draft') {
      setIsPublished(false);
    } else {
      setIsPublished(true);
    }
  }

  const submitHandler = async () => {
    const payload = {
      title,
      description,
      dueDate,
      durationMinutes: Number(durationMinutes),
      subject: selectedSubject,
      assignedStudents: selectedStudents,
      // new fields
      isPublished,
      status,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      attemptRules: { allowRetake, maxAttempts: Number(maxAttempts) }
    };

    const { data } = await API.post("/teacher/tests", payload);
    if (data.success) {
      showSuccess(data.message);
    } else {
      showError("Failed to create test");
      console.error(data.message);
    }
    navigate("/tests");
  };

  return (
      <div className="main">
      <div className="create-test-container">
        <button className="test-back" onClick={() => navigate("/tests")}>
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

        <label>Duration (minutes)</label>
        <input
          type="number"
          min="1"
          placeholder="Enter duration in minutes"
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
        />

        <label>Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />

        {/* <label className="row-inline">
          <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} /> {' '}
          Publish now
        </label> */}

        <label>Status</label>
        <select value={status} onChange={handleChangeStatus}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>

        <label>Attempt Rules</label>
        <div className="attempt-rules">
          <label><input type="checkbox" checked={allowRetake} onChange={e => setAllowRetake(e.target.checked)} /> Allow retake</label>
          <label style={{marginLeft:12}}>Max attempts <input type="number" min="1" value={maxAttempts} onChange={e=>setMaxAttempts(e.target.value)} style={{width:80, marginLeft:8}}/></label>
        </div>

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

        <button onClick={submitHandler}>Create Test</button>
      </div>
    </div>
     </div>
  );
}
