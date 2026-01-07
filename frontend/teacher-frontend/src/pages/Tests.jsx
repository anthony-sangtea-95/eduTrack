import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import  API  from '../services/api'

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

  if (loading) return <p>Loading tests...</p>
  if (error) return <p className="error">Failed to load tests</p>

  return (
    <div className="page" style={{ margin: '0 20px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <h2>My Tests</h2>

        <Link to="/tests/create">
          + Create Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No tests created yet.</p>
      ) : (
        <ul className="card">
          {tests.map(test => (
            <li
              key={test.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <div>
                <strong>{test.title}</strong>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                </div>
              </div>

              <Link
                className="button small"
                to={`/tests/${test.id}/questions`}
              >
                Manage Questions
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
