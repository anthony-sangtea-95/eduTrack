import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import  API  from '../services/api'
import Loading from '../components/Loading.jsx'
import TestList from '../components/TestList.jsx'
import "../assets/css/Tests.css"

export default function Tests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setError(false)
      setLoading(true)
      const res = await API.get('teacher/tests')
      setTests(res.data)
    } catch (err) {
      console.error('Failed to load tests', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this test?");
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/teacher/tests/${id}`);

      if (data.success) {
        setTests(prev => prev.filter(test => test._id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete test");
    }
};

  if (loading) return <Loading />

  return (
      <main className="main">
         <div className="page tests-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Teaching workspace</p>
            <h1>My tests</h1>
            <p className="page-description">Create assessments, manage their questions, and keep an eye on submissions.</p>
          </div>
          <Link className="button no-underline" to="/tests/create">
            + Create test
          </Link>
        </div>
      {error ? (
        <div className="question-empty-state" role="alert">
          <span className="question-empty-mark" aria-hidden="true">!</span>
          <div>
            <h2>Tests could not be loaded</h2>
            <p>Please check your connection and try again.</p>
          </div>
          <button className="button" type="button" onClick={fetchTests}>Try again</button>
        </div>
      ) : tests.length === 0 ? (
        <section className="question-empty-state">
          <span className="question-empty-mark" aria-hidden="true">+</span>
          <div>
            <h2>No tests created yet</h2>
            <p>Create an assessment, assign students, then add questions to get started.</p>
          </div>
          <Link className="button no-underline" to="/tests/create">Create your first test</Link>
        </section>
      ) : (
        <section className="tests-list-card">
          <div className="question-table-caption">
            <div>
              <h2>Your assessments</h2>
              <p>{tests.length} {tests.length === 1 ? 'test' : 'tests'} total</p>
            </div>
          </div>
        <ul className="tests-list">
          {tests.map(test => (
            <TestList key={test._id} test={test} handleDelete={handleDelete} />
          ))}
        </ul>
        </section>
      )}
    </div>
    </main>
  )
}
