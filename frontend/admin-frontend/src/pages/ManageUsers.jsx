import React, { useEffect, useMemo, useState } from 'react'
import API from '../services/api'


export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to load users', err)
      setError('We could not load user accounts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter(user =>
      `${user.name || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase().includes(query)
    )
  }, [users, search])

  return (
    <main className="main">
      <div className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Administration</p>
            <h1>Manage users</h1>
            <p>Review account details and roles across your learning community.</p>
          </div>
          {!loading && !error && (
            <div className="admin-count-card">
              <strong>{users.length}</strong>
              <span>{users.length === 1 ? 'account' : 'accounts'}</span>
            </div>
          )}
        </header>

        {error ? (
          <section className="admin-state-card admin-error-card" role="alert">
            <span className="admin-state-icon" aria-hidden="true">!</span>
            <div>
              <h2>Accounts are unavailable</h2>
              <p>{error}</p>
            </div>
            <button className="button" type="button" onClick={load}>Try again</button>
          </section>
        ) : (
          <section className="admin-data-card">
            <div className="admin-data-toolbar">
              <div>
                <h2>User directory</h2>
                <p>{loading ? 'Loading accounts…' : `${filteredUsers.length} ${filteredUsers.length === 1 ? 'account' : 'accounts'} shown`}</p>
              </div>
              <label className="admin-search">
                <span aria-hidden="true">⌕</span>
                <span className="sr-only">Search users</span>
                <input
                  type="search"
                  placeholder="Search name, email, or role"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </label>
            </div>

            {loading ? (
              <div className="admin-loading-list" aria-hidden="true">
                {[0, 1, 2, 3].map(item => <div className="admin-user-skeleton" key={item} />)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="admin-empty-state">
                <span className="admin-state-icon" aria-hidden="true">⌕</span>
                <div>
                  <h2>{users.length ? 'No matching accounts' : 'No user accounts found'}</h2>
                  <p>{users.length ? 'Try a different name, email, or role.' : 'User accounts will appear here when they are available.'}</p>
                </div>
                {search && <button className="admin-clear-search" type="button" onClick={() => setSearch('')}>Clear search</button>}
              </div>
            ) : (
              <div className="admin-table-scroll">
                <table className="table admin-users-table">
                  <thead>
                    <tr><th>Name</th><th>Email address</th><th>Role</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-user-name">
                            <span aria-hidden="true">{(user.name || '?').trim().charAt(0).toUpperCase()}</span>
                            <strong>{user.name || 'Unnamed account'}</strong>
                          </div>
                        </td>
                        <td>{user.email || '—'}</td>
                        <td><span className={`admin-role-badge admin-role-${(user.role || 'unknown').toLowerCase()}`}>{user.role || 'Unknown'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}