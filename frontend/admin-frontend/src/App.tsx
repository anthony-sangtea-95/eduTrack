import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ManageUsers from './pages/ManageUsers.jsx'
import TestTypes from './pages/TestTypes.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from "./layouts/MainLayout.jsx";

export default function App() {
return (
<AuthProvider>
    <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/test-types" element={<TestTypes />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
    </Routes>
</AuthProvider>
)
}