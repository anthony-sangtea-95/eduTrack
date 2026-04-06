import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../assets/css/ManageQuestions.css";

export default function ManageQuestions() {
  const { testId } = useParams();

  const [testQuestions, setTestQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | added | not-added

  const load = async () => {
    try {
      const testRes = await API.get(`/teacher/tests/${testId}/questions`);
      const allRes = await API.get(`/teacher/questions`);

      setTestQuestions(testRes.data || []);
      setAllQuestions(allRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isInTest = (id) =>
    testQuestions.some((q) => q._id === id);

  // 🔍 Filter + search logic
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchSearch = q.questionText
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === "added") return isInTest(q._id);
      if (filter === "not-added") return !isInTest(q._id);

      return true;
    });
  }, [allQuestions, search, filter, testQuestions]);

  // ⚡ Optimistic Add
  const addQuestion = async (questionId) => {
    setTestQuestions((prev) => [
      ...prev,
      allQuestions.find((q) => q._id === questionId),
    ]);

    try {
      await API.post(`/teacher/tests/${testId}/questions/add`, {
        questionId,
      });
    } catch (err) {
      console.error(err);
      load(); // fallback
    }
  };

  // ⚡ Optimistic Remove
  const removeQuestion = async (questionId) => {
    setTestQuestions((prev) =>
      prev.filter((q) => q._id !== questionId)
    );

    try {
      await API.post(`/teacher/tests/${testId}/questions/remove`, {
        questionId,
      });
    } catch (err) {
      console.error(err);
      load(); // fallback
    }
  };

  return (
    <div className="app-shell">

      <main className="main">
        <div className="header">
          <h1>Manage Questions</h1>
        </div>

        {/* 🔍 Search + Filter */}
        <div className="card" style={{ marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={() => setFilter("all")} className="button small-btn">All</button>
            <button onClick={() => setFilter("added")} className="button small-btn">Added</button>
            <button onClick={() => setFilter("not-added")} className="button small-btn">Not Added</button>
          </div>
        </div>

        <div className="row">
          {/* LEFT: ALL QUESTIONS */}
          <div className="col card scroll-panel">
            <h3>All Questions</h3>

            {filteredQuestions.map((q) => {
              const added = isInTest(q._id);

              return (
                <div key={q._id} className="question-card">
                  <p><strong>{q.questionText}</strong></p>

                  <div className="small">
                    A: {q.options?.a} | B: {q.options?.b}
                  </div>

                  {added ? (
                    <span className="badge added">Added</span>
                  ) : (
                    <button
                      className="button add-btn"
                      onClick={() => addQuestion(q._id)}
                    >
                      + Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: TEST QUESTIONS */}
          <div className="col card scroll-panel">
            <h3>In This Test ({testQuestions.length})</h3>

            {testQuestions.map((q) => (
              <div key={q._id} className="question-card">
                <p><strong>{q.questionText}</strong></p>

                <div className="small">
                  A: {q.options?.a} | B: {q.options?.b}
                </div>

                <button
                  className="button remove-btn"
                  onClick={() => removeQuestion(q._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}