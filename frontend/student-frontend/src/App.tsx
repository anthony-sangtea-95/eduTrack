import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MyTests from './pages/MyTests.jsx'
import TakeTest from './pages/TakeTest.jsx'
import ViewResult from './pages/ViewResult.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute><MyTests /></ProtectedRoute>} />
      <Route path="/tests/:testId/take" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
      <Route path="/tests/:testId/result" element={<ProtectedRoute><ViewResult /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}