import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import LandingPage from '../features/landing/pages/LandingPage'
import LoginPage from '../features/auth/pages/LoginPage'
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import AdminLayout from '../features/admin/layouts/AdminLayout'
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'
import AdminNotificationsPage from '../features/admin/pages/AdminNotificationsPage'
import AdminClientsPage from '../features/admin/pages/AdminClientsPage'
import AdminNewClientPage from '../features/admin/pages/AdminNewClientPage'
import AdminClientProfilePage from '../features/admin/pages/AdminClientProfilePage'
import AdminEditClientPage from '../features/admin/pages/AdminEditClientPage'
import AdminNewMeasurementPage from '../features/admin/pages/AdminNewMeasurementPage'
import AdminEditMeasurementPage from '../features/admin/pages/AdminEditMeasurementPage'
import AdminNewRoutinePage from '../features/admin/pages/AdminNewRoutinePage'
import AdminEditRoutinePage from '../features/admin/pages/AdminEditRoutinePage'
import AdminNewProgressPage from '../features/admin/pages/AdminNewProgressPage'
import AdminEditProgressPage from '../features/admin/pages/AdminEditProgressPage'
import ClientLayout from '../features/client/layouts/ClientLayout'
import ClientDashboardPage from '../features/client/pages/ClientDashboardPage'
import ClientRoutinePage from '../features/client/pages/ClientRoutinePage'
import ClientMeasurementsPage from '../features/client/pages/ClientMeasurementsPage'
import ClientNewMeasurementPage from '../features/client/pages/ClientNewMeasurementPage'
import ClientEditMeasurementPage from '../features/client/pages/ClientEditMeasurementPage'
import ClientProgressPage from '../features/client/pages/ClientProgressPage'
import ClientProfilePage from '../features/client/pages/ClientProfilePage'
import ProtectedRoute from './ProtectedRoute'
import NotFoundPage from '../features/errors/pages/NotFoundPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<AdminDashboardPage />}
            />

            <Route
              path="notifications"
              element={<AdminNotificationsPage />}
            />

            <Route
              path="change-password"
              element={<ChangePasswordPage />}
            />

            <Route
              path="clients"
              element={<AdminClientsPage />}
            />

            <Route
              path="clients/new"
              element={<AdminNewClientPage />}
            />

            <Route
              path="clients/:id"
              element={<AdminClientProfilePage />}
            />

            <Route
              path="clients/:id/edit"
              element={<AdminEditClientPage />}
            />

            <Route
              path="clients/:id/measurements/new"
              element={<AdminNewMeasurementPage />}
            />

            <Route
              path="clients/:id/measurements/:measurementId/edit"
              element={<AdminEditMeasurementPage />}
            />

            <Route
              path="clients/:id/routines/new"
              element={<AdminNewRoutinePage />}
            />

            <Route
              path="clients/:id/routines/:routineId/edit"
              element={<AdminEditRoutinePage />}
            />

            <Route
              path="clients/:id/progress/new"
              element={<AdminNewProgressPage />}
            />

            <Route
              path="clients/:id/progress/:progressId/edit"
              element={<AdminEditProgressPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<ClientDashboardPage />}
            />

            <Route
              path="routine"
              element={<ClientRoutinePage />}
            />

            <Route
              path="measurements"
              element={<ClientMeasurementsPage />}
            />

            <Route
              path="measurements/new"
              element={<ClientNewMeasurementPage />}
            />

            <Route
              path="measurements/:measurementId/edit"
              element={<ClientEditMeasurementPage />}
            />

            <Route
              path="progress"
              element={<ClientProgressPage />}
            />

            <Route
              path="profile"
              element={<ClientProfilePage />}
            />

            <Route
              path="change-password"
              element={<ChangePasswordPage />}
            />
          </Route>
        </Route>
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter



