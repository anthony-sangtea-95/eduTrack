import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../assets/css/ManageQuestions.css";

export default function ManageQuestions() {
  const { testId } = useParams();
  const [testName, setTestName] = useState("");

  const [testQuestions, setTestQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | added | not-added
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const testRes = await API.get(`/teacher/tests/${testId}/questions`);
      const allRes = await API.get(`/teacher/tests/${testId}/accessibleQuestions`); // get all accessible questions by teacher and quiz type

      setTestName(testRes.data.testName || "");
      setTestQuestions(testRes.data.questions || []);
      setAllQuestions(allRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load the questions for this test. Please try again.");
    } finally {
      setLoading(false);
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
      await API.delete(`/teacher/tests/${testId}/questions/${questionId}/remove`);
    } catch (err) {
      console.error(err);
      load(); // fallback
    }
  };

  return (
    <div className="app-shell">

      <main className="main">
        <div className="manage-questions-page">
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Assessment builder</p>
              <h1>{testName || 'Manage questions'}</h1>
              <p className="page-description">Choose which questions belong in this test. Add or remove questions as needed.</p>
            </div>
            <div className="selected-question-count">
              <strong>{testQuestions.length}</strong>
              <span>in this test</span>
            </div>
          </div>

          <section className="question-library-toolbar" aria-label="Find questions">
            <label className="question-search">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search questions</span>
              <input
                className="input"
                placeholder="Search question text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="question-filter-group" aria-label="Filter questions">
              {[
                ["all", "All questions"],
                ["added", "In this test"],
                ["not-added", "Not added"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`question-filter ${filter === value ? "active" : ""}`}
                  aria-pressed={filter === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {error ? (
            <section className="question-empty-state" role="alert">
              <span className="question-empty-mark" aria-hidden="true">!</span>
              <div>
                <h2>Question library unavailable</h2>
                <p>{error}</p>
              </div>
              <button type="button" className="button" onClick={load}>Try again</button>
            </section>
          ) : loading ? (
            <div className="question-loading-state" role="status">Loading question library…</div>
          ) : (
          <div className="question-builder-grid">
            <section className="question-builder-panel">
              <div className="question-builder-heading">
                <div>
                  <h2>Question library</h2>
                  <p>{filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'} shown</p>
                </div>
              </div>
              <div className="question-builder-list">
                {filteredQuestions.length === 0 ? (
                  <p className="question-list-empty">{search ? 'No questions match your search.' : 'No questions match this filter.'}</p>
                ) : filteredQuestions.map((q) => {
                  const added = isInTest(q._id);
                  return (
                    <article key={q._id} className="builder-question-card">
                      <div className="builder-question-copy">
                        <p className="builder-question-text">{q.questionText}</p>
                        <p className="builder-question-meta">
                          {q.subject?.subjectName || 'General subject'} <span>·</span> {q.mark ?? 0} {q.mark === 1 ? 'mark' : 'marks'}
                        </p>
                        <div className="builder-option-preview">
                          {["a", "b", "c", "d"].filter(key => q.options?.[key]).map(key => (
                            <span key={key}><strong>{key.toUpperCase()}</strong> {q.options[key]}</span>
                          ))}
                        </div>
                      </div>
                      {added
                        ? <span className="question-added-status">Added</span>
                        : <button type="button" className="button builder-add-button" onClick={() => addQuestion(q._id)}>+ Add</button>}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="question-builder-panel selected-questions-panel">
              <div className="question-builder-heading">
                <div>
                  <h2>In this test</h2>
                  <p>Questions included in the assessment</p>
                </div>
                <span className="selected-question-badge">{testQuestions.length}</span>
              </div>
              <div className="question-builder-list">
                {testQuestions.length === 0 ? (
                  <div className="question-list-empty">
                    <strong>No questions added yet</strong>
                    <span>Use the Add button in the library to build this test.</span>
                  </div>
                ) : testQuestions.map((q) => (
                  <article key={q._id} className="builder-question-card selected">
                    <div className="builder-question-copy">
                      <p className="builder-question-text">{q.questionText}</p>
                      <p className="builder-question-meta">
                        {q.subject?.subjectName || 'General subject'} <span>·</span> {q.mark ?? 0} {q.mark === 1 ? 'mark' : 'marks'}
                      </p>
                    </div>
                    <button type="button" className="builder-remove-button" onClick={() => removeQuestion(q._id)}>Remove</button>
                  </article>
                ))}
              </div>
            </section>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}