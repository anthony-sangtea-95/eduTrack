import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useParams } from "react-router-dom";
import "../assets/css/Question.css";
import Loading from '../components/Loading.jsx'

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {testId} = useParams()

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/teacher/tests/${testId}/questions`);
      setQuestions(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await API.delete(`/teacher/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Questions</h2>
        <Link to={`/teacher/tests/${testId}/question/create`} className="btn">
          + Add New Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr key={q._id}>
                <td>{index + 1}</td>
                <td>{q.text}</td>
                <td>{q.type}</td>
                <td className="actions">
                  <Link
                    to={`/teacher/questions/${q._id}/edit`}
                    className="btn btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteQuestion(q._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
