import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban'
import Projects, { ProjectDetails } from './pages/Projects'
import TaskDetail from './pages/TaskDetail'
import CreateWorkspace from './pages/CreateWorkspace'
import Members from './pages/Members'
import WorkspaceSettings from './pages/WorkspaceSettings'
import InvitationAcceptance from './pages/InvitationAcceptance'
import Invitations from './pages/Invitations'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 15, 22, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              padding: '0.75rem 1rem',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
              style: {
                border: '1px solid rgba(34, 197, 94, 0.3)',
                background: 'rgba(15, 15, 22, 0.95)',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(15, 15, 22, 0.95)',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invitations/:token" element={<InvitationAcceptance />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WorkspaceProvider>
                  <Layout />
                </WorkspaceProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="projects" element={<Projects />} />
            <Route
              path="projects/:id"
              element={
                <ErrorBoundary>
                  <ProjectDetails />
                </ErrorBoundary>
              }
            />
            <Route path="members" element={<Members />} />
            <Route path="workspace-settings" element={<WorkspaceSettings />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="create-workspace" element={<CreateWorkspace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
