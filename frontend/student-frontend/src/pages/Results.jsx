import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../services/api';

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get(`/student/submissions/${testId}`);
        setResults(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Unable to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  const closeModal = () => setSelectedResult(null);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    if (value === '-') return '-';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main student-results-page">
        <div className="student-results-content">
          <button className="student-back-link" onClick={() => navigate('/tests')} type="button">
            ← My tests
          </button>
          <div className="student-results-heading">
            <p className="student-dashboard-eyebrow">Assessment history</p>
            <h1>{loading ? '' : results[0]?.test?.title || 'Test results'}</h1>
            <p>{loading ? '' : results[0]?.test?.description || 'Review your submissions and answer details.'}</p>
          </div>

          {loading && <div className="student-results-state" role="status">Loading your results…</div>}
          {error && <div className="student-results-state error" role="alert">{error}</div>}
          {!loading && !error && results.length === 0 && (
            <div className="student-results-state empty">No submitted results are available for this test yet.</div>
          )}

          <div className="student-results-grid">
            {results.map((result) => (
              <article key={result._id || result.id} className="student-result-card">
                <div className="student-result-card-heading">
                  <div className="student-result-score">
                    <span className="student-result-label">Score</span>
                    <strong>{result.score ?? 'N/A'}<span> / {result.test?.totalMarks ?? 'N/A'}</span></strong>
                  </div>
                  <span className={`badge ${result.result === 'Pass' ? 'success' : 'danger'}`}>
                    {result.result || 'Result pending'}
                  </span>
                </div>
                <div className="student-result-metrics">
                  <div><span>Correct</span><strong>{result.correct ?? 'N/A'}</strong></div>
                  <div><span>Wrong</span><strong>{result.wrong ?? 'N/A'}</strong></div>
                  <div>
                    <span>Time taken</span>
                    <strong>{result.timeTakenInSeconds ? `${Math.floor(result.timeTakenInSeconds / 60)}m ${result.timeTakenInSeconds % 60}s` : 'N/A'}</strong>
                  </div>
                </div>
                <div className="student-result-card-footer">
                  <span>Submitted {formatDate(result.submittedAt || '-')}</span>
                  <button className="student-result-details-button" onClick={() => setSelectedResult(result)} type="button">
                    Review answers
                  </button>
                </div>
              </article>
            ))}
          </div>

          {selectedResult && (
            <div className="student-modal-backdrop">
              <section className="student-results-modal" role="dialog" aria-modal="true" aria-labelledby="student-result-modal-title">
                <div className="student-results-modal-heading">
                  <div>
                    <p className="student-dashboard-eyebrow">Answer review</p>
                    <h2 id="student-result-modal-title">{selectedResult.test?.title || 'Results'}</h2>
                    <p>{selectedResult.test?.description || 'Review your answers alongside the correct responses.'}</p>
                  </div>
                  <button className="student-modal-close" aria-label="Close answer review" onClick={closeModal} type="button">×</button>
                </div>
                <div className="student-result-answers">
                  {selectedResult.answers.map((answer) => {
                    const isCorrect = answer.selected === answer.question.correctOption;
                    const selectedText = answer.selected
                      ? `${answer.selected.toUpperCase()}. ${answer.question.options?.[answer.selected] || 'No option text'}`
                      : 'Not answered';
                    const correctOption = answer.question.correctOption || '';
                    const correctText = `${correctOption ? `${correctOption.toUpperCase()}. ` : ''}${answer.question.options?.[correctOption] || 'No option text'}`;

                    return (
                      <article key={answer.question._id} className={`student-result-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <h3 className="student-result-question">{answer.question.questionText}</h3>
                        <p className="student-result-answer-text">Your answer: <strong>{selectedText}</strong></p>
                        <p className="student-result-answer-text">Correct answer: <strong>{correctText}</strong></p>
                      </article>
                    );
                  })}
                </div>
                <div className="student-results-modal-footer">
                  <button className="student-result-details-button" onClick={closeModal} type="button">Close review</button>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;
