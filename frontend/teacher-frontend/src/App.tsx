import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
// import ManageUsers from './pages/ManageUsers.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


export default function App() {
return (
<AuthProvider>
<Routes>
<Route path="/login" element={<Login />} />

<Route
path="/"
element={
<ProtectedRoute>
<Navigate to="/dashboard" replace />
</ProtectedRoute>
}
/>


<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard />
</ProtectedRoute>
}
/>

{/* 
<Route
path="/manage-users"
element={
<ProtectedRoute>
<ManageUsers />
</ProtectedRoute>
}
/> */}

<Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
</AuthProvider>
)
}