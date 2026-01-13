import { useEffect, useState } from "react"
import "../assets/css/CreateQuestion.css"

export default function CreateQuestion() {
  const [form, setForm] = useState({
    test: "",
    questionType: "",
    questionText: "",
    options: { a: "", b: "", c: "", d: "" },
    correctOption: "",
    allowedTeachers: [],
  })

  const [tests, setTests] = useState([])
  const [types, setTypes] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsRes, typesRes, teachersRes] = await Promise.all([
          API.get("/teacher/tests"),
          API.get("/teacher/test-types"),
          API.get("/users?role=teacher"),
        ])

        setTests(testsRes.data)
        setTypes(typesRes.data)
        setTeachers(teachersRes.data)
      } catch (err) {
        console.error(err)
        alert("Failed to load data")
      }
    }

    loadData()
  }, [])

  const updateOption = (key, value) => {
    setForm({ ...form, options: { ...form.options, [key]: value } })
  }

  const toggleTeacher = (id) => {
    setForm({
      ...form,
      allowedTeachers: form.allowedTeachers.includes(id)
        ? form.allowedTeachers.filter((t) => t !== id)
        : [...form.allowedTeachers, id],
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
      },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      alert("Question created successfully ✔")
      setForm({
        test: "",
        questionType: "",
        questionText: "",
        options: { a: "", b: "", c: "", d: "" },
        correctOption: "",
        allowedTeachers: [],
      })
    } else {
      alert("Failed to create question")
    }
  }

  return (
    <div className="cq-container">
      <div className="cq-card">
        <h2>Create Question</h2>

        <form onSubmit={submitHandler}>
          <div className="row">
            <select
              required
              value={form.questionType}
              onChange={(e) =>
                setForm({ ...form, questionType: e.target.value })
              }
            >
              <option value="">Question Type</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>

            <select
              value={form.test}
              onChange={(e) => setForm({ ...form, test: e.target.value })}
            >
              <option value="">No Test (Optional)</option>
              {tests.map((t) => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Enter question text..."
            required
            value={form.questionText}
            onChange={(e) =>
              setForm({ ...form, questionText: e.target.value })
            }
          />

          <div className="options">
            {["a", "b", "c", "d"].map((k) => (
              <input
                key={k}
                placeholder={`Option ${k.toUpperCase()}`}
                required
                value={form.options[k]}
                onChange={(e) => updateOption(k, e.target.value)}
              />
            ))}
          </div>

          <select
            required
            value={form.correctOption}
            onChange={(e) =>
              setForm({ ...form, correctOption: e.target.value })
            }
          >
            <option value="">Correct Option</option>
            {["a", "b", "c", "d"].map((k) => (
              <option key={k} value={k}>{k.toUpperCase()}</option>
            ))}
          </select>

          <div className="teachers">
            <p>Allow other teachers</p>
            {teachers.map((t) => (
              <label key={t._id}>
                <input
                  type="checkbox"
                  checked={form.allowedTeachers.includes(t._id)}
                  onChange={() => toggleTeacher(t._id)}
                />
                {t.name}
              </label>
            ))}
          </div>

          <button disabled={loading}>
            {loading ? "Saving..." : "Create Question"}
          </button>
        </form>
      </div>
    </div>
  )
}
