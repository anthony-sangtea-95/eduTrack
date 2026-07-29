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
    console.log("Submitting payload:", payload);

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
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <button className="text-slate-600 text-sm hover:underline" onClick={() => navigate("/tests")}>
      ← Back
    </button>
    <h1 className="text-2xl font-bold text-slate-800">Create New Test</h1>
    <div></div> {/* Spacer */}
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Left Column: Basic Info & Settings (2 cols) */}
    <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-700">Test Details</h2>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input type="text" placeholder="Enter test title" className="w-full border rounded-lg p-2.5" value={title} onChange={e => setTitle(e.target.value)}/>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea placeholder="Describe the test" rows={3} className="w-full border rounded-lg p-2.5" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
          <input type="datetime-local" className="w-full border rounded-lg p-2.5 text-sm" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
          <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
          <input type="number" placeholder="60" className="w-full border rounded-lg p-2.5" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select className="w-full border rounded-lg p-2.5 bg-white" value={status} onChange={handleChangeStatus}>
            <option>Draft</option>
            <option>Published</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      {/* Attempt Rules */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" checked={allowRetake} onChange={e => setAllowRetake(e.target.checked)} />
          <span className="text-sm font-medium text-slate-700">Allow Retakes</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Max attempts:</span>
          <input type="number" min={1} className="w-16 border rounded-lg p-1.5 text-center" 
            value={maxAttempts}
            disabled={!allowRetake}
            onChange={e => setMaxAttempts(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Right Column: Subjects & Students (1 col) */}
    <div className="space-y-6">
      
      {/* Subjects Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              type="button"
              className={`text-sm subject-card ${selectedSubject === subject._id ? 'active' : ''}`}
              onClick={() => setSelectedSubject(subject._id)}
            >
              {subject.subjectName}
            </div>
          ))}
        </div>
      </div>

      {/* Assign Students Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Assign Students</h2>
        <input 
          type="text" 
          placeholder="Search students..." 
          className="w-full border rounded-lg p-2 text-sm mb-3"
        />
        <div className="students-list">
          {students.map((student) => (
            <div
              key={student._id}
              className={`student-item text-sm ${selectedStudents.includes(student._id) ? 'selected' : ''}`}
              onClick={() => toggleStudent(student._id)} 
            >
              {student.name}
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={submitHandler}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm transition"
      >
        Create Test
      </button>

    </div>
  </div>
    </div>
  )
}
