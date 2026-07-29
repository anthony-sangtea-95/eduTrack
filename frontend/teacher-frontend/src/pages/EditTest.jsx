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

  // New fields from Test schema
  const [isPublished, setIsPublished] = useState(false);
  const [status, setStatus] = useState('draft');
  const [startTime, setStartTime] = useState('');
  const [allowRetake, setAllowRetake] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);


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

      // new fields
      setIsPublished(!!test.isPublished);
      setStatus(test.status || 'draft');
      setStartTime(test.startTime ? new Date(test.startTime).toISOString().slice(0,16) : '');
      setAllowRetake(!!test.attemptRules?.allowRetake);
      setMaxAttempts(test.attemptRules?.maxAttempts ?? 1);

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
    try {
      setSaving(true);

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

      const { data } = await API.put(`/teacher/tests/${testId}`, payload);

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
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button className="text-slate-600 text-sm hover:underline" onClick={() => navigate("/tests")}>
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Edit Test</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700">Test Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter test title"
              className="w-full border rounded-lg p-2.5"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              placeholder="Describe the test"
              rows={3}
              className="w-full border rounded-lg p-2.5"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
              <input
                type="number"
                min="1"
                placeholder="60"
                className="w-full border rounded-lg p-2.5"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                className="w-full border rounded-lg p-2.5 bg-white"
                value={status}
                onChange={handleChangeStatus}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={allowRetake}
                onChange={e => setAllowRetake(e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-700">Allow Retakes</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Max attempts:</span>
              <input
                type="number"
                min={1}
                className="w-16 border rounded-lg p-1.5 text-center"
                value={maxAttempts}
                disabled={!allowRetake}
                onChange={e => setMaxAttempts(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <div
                  key={subject._id}
                  className={`text-sm subject-card ${selectedSubject === subject._id ? "active" : ""}`}
                  onClick={() => setSelectedSubject(subject._id)}
                >
                  {subject.subjectName}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Assign Students</h2>
            <input
              type="text"
              placeholder="Search students..."
              className="w-full border rounded-lg p-2 text-sm mb-3"
            />
            <div className="students-list">
              {students.map(s => (
                <div
                  key={s._id}
                  className={`student-item text-sm ${selectedStudents.includes(s._id) ? "selected" : ""}`}
                  onClick={() => toggleStudent(s._id)}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={submitHandler}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm transition"
          >
            {saving ? "Updating..." : "Update Test"}
          </button>
        </div>
      </div>
    </div>
  );
}