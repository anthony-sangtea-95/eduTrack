import React, { useEffect, useMemo, useState } from 'react'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'


export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'student', password: '' })
  const { user: currentUser } = useAuth()

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

  const resetForm = () => {
    setEditingId(null)
    setActionError('')
    setActionMessage('')
    setForm({ name: '', email: '', role: 'student', password: '' })
  }

  const submitUser = async event => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      ...(form.password ? { password: form.password } : {}),
    }

    try {
      if (editingId) {
        const response = await API.put(`/admin/users/${editingId}`, payload)
        setUsers(previous => previous.map(user => user._id === editingId ? response.data : user))
        resetForm()
        setActionMessage('Account updated successfully.')
      } else {
        const response = await API.post('/admin/users', payload)
        setUsers(previous => [...previous, response.data])
        resetForm()
        setActionMessage('Account added successfully.')
      }
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to save this account. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const editUser = user => {
    setEditingId(user._id)
    setActionError('')
    setActionMessage('')
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'student', password: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteUser = async user => {
    if (!window.confirm(`Delete ${user.name || user.email}'s account? This cannot be undone.`)) return

    setActionError('')
    setActionMessage('')
    setDeletingId(user._id)
    try {
      await API.delete(`/admin/users/${user._id}`)
      setUsers(previous => previous.filter(account => account._id !== user._id))
      if (editingId === user._id) resetForm()
      setActionMessage('Account deleted successfully.')
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to delete this account. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

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

        {actionMessage && <p className="admin-user-success" role="status">{actionMessage}</p>}

        <section className="admin-data-card admin-user-form-card">
          <div className="admin-data-toolbar">
            <div>
              <h2>{editingId ? 'Update account' : 'Add an account'}</h2>
              <p>{editingId ? 'Update account details. Leave the password blank to keep it unchanged.' : 'Create an administrator, teacher, or student account.'}</p>
            </div>
          </div>
          <form className="admin-user-form" onSubmit={submitUser}>
            {actionError && <div className="admin-login-error" role="alert">{actionError}</div>}
            <label>
              <span>Full name</span>
              <input className="input" type="text" value={form.name} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} maxLength={100} autoComplete="name" required />
            </label>
            <label>
              <span>Email address</span>
              <input className="input" type="email" value={form.email} onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))} maxLength={254} autoComplete="email" required />
            </label>
            <label>
              <span>Role</span>
              <select className="input" value={form.role} onChange={event => setForm(previous => ({ ...previous, role: event.target.value }))} disabled={editingId === currentUser?._id} required>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
              {editingId === currentUser?._id && <small className="admin-user-form-hint">Your account must remain an administrator.</small>}
            </label>
            <label>
              <span>{editingId ? 'New password (optional)' : 'Password'}</span>
              <input className="input" type="password" value={form.password} onChange={event => setForm(previous => ({ ...previous, password: event.target.value }))} minLength={8} maxLength={72} autoComplete="new-password" required={!editingId} />
            </label>
            <div className="admin-user-form-actions">
              <button className="button" type="submit" disabled={saving || loading}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add account'}
              </button>
              {editingId && <button className="admin-user-cancel" type="button" disabled={saving} onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </section>

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
                    <tr><th>Name</th><th>Email address</th><th>Role</th><th>Actions</th></tr>
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
                        <td>
                          <div className="admin-user-actions">
                            <button className="admin-user-edit" type="button" onClick={() => editUser(user)}>Edit</button>
                            <button
                              className="admin-user-delete"
                              type="button"
                              disabled={user._id === currentUser?._id || deletingId === user._id}
                              title={user._id === currentUser?._id ? 'You cannot delete your own account' : undefined}
                              onClick={() => deleteUser(user)}
                            >
                              {deletingId === user._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </td>
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