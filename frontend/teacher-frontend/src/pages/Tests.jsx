import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import  API  from '../services/api'
import Loading from '../components/Loading.jsx'
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
  if (error) return <p className="error">Failed to load tests</p>

  return (
      <div className='main'>
         <div className="page" style={{ margin: '0 20px'}}>
        <h2 className='text-align-c'>My Tests</h2>
        <div className='text-align-r'>
          <Link className='create-test-button no-underline' to="/tests/create">
           + New Test
          </Link>
        </div>
      {tests.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No tests created yet.</p>
      ) : (
        <ul className="card">
          {tests.map(test => (
            <li
              key={test._id}
              className="test-item"
            >
              <div className="test-info">
                <div className="flex items-center gap-3">
                  <strong>{test.title}</strong>
                  {test.isPublished ? <span className="badge badge-green">Published</span> : <span className="badge">{test.status}</span>}
                </div>
                <div className="test-date">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                  {test.startTime ? <span className="ml-3">Starts: {new Date(test.startTime).toLocaleString()}</span> : null}
                  <div className="test-meta">
                    <span className="meta-item">Max attempts per student: <strong>{test.attemptRules?.maxAttempts ?? 1}</strong></span>
                    <span className="meta-item">Total submissions: <strong>{test.totalSubmissions ?? 0}</strong></span>
                    <span className="meta-item">Students submitted: <strong>{test.distinctStudentsSubmitted ?? 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="test-actions">
                <Link 
                  to={`/tests/manage/${test._id}`} 
                  className="btn-test btn-test-manage"
                >
                  Manage
                </Link>

                <Link 
                  to={`/tests/edit/${test._id}`} 
                  className="btn-test btn-test-edit"
                >
                  Edit
                </Link>

                <button 
                  onClick={() => handleDelete(test._id)} 
                  className="btn-test btn-test-delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  )
}
