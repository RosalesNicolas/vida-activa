import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getCurrentUser,
  loginRequest,
} from '../services/authService'
import { AuthContext } from './authContextInstance'

const TOKEN_KEY = 'vidaActivaToken'
const USER_KEY = 'vidaActivaUser'
const LAST_ACTIVITY_KEY = 'vidaActivaLastActivity'

const ADMIN_INACTIVITY_TIME = 30 * 60 * 1000
const CLIENT_INACTIVITY_TIME = 2 * 60 * 60 * 1000
const WARNING_TIME = 60 * 1000

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY),
  )

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY)

    try {
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  })

  const [loading, setLoading] = useState(true)
  const [showInactivityWarning, setShowInactivityWarning] =
    useState(false)
  const [warningSeconds, setWarningSeconds] = useState(60)

  const warningTimeoutRef = useRef(null)
  const logoutTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const lastActivityResetRef = useRef(0)
  const warningVisibleRef = useRef(false)

  useEffect(() => {
    warningVisibleRef.current = showInactivityWarning
  }, [showInactivityWarning])

  const clearInactivityTimers = useCallback(() => {
    window.clearTimeout(warningTimeoutRef.current)
    window.clearTimeout(logoutTimeoutRef.current)
    window.clearInterval(countdownIntervalRef.current)

    warningTimeoutRef.current = null
    logoutTimeoutRef.current = null
    countdownIntervalRef.current = null
  }, [])

  const logout = useCallback(() => {
    clearInactivityTimers()

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(LAST_ACTIVITY_KEY)

    setToken(null)
    setUser(null)
    setShowInactivityWarning(false)
    setWarningSeconds(60)
  }, [clearInactivityTimers])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    const currentTime = Date.now()

    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user),
    )
    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      String(currentTime),
    )

    setToken(data.token)
    setUser(data.user)

    return data.user
  }, [])

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser(token)

        setUser(data.user)

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(data.user),
        )
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [token, logout])

  const expireSession = useCallback(() => {
    logout()
    window.location.replace('/login?reason=inactivity')
  }, [logout])

  const startWarningCountdown = useCallback(
    (remainingMilliseconds) => {
      window.clearInterval(countdownIntervalRef.current)

      setShowInactivityWarning(true)
      setWarningSeconds(
        Math.max(
          1,
          Math.ceil(remainingMilliseconds / 1000),
        ),
      )

      countdownIntervalRef.current =
        window.setInterval(() => {
          setWarningSeconds((currentSeconds) =>
            Math.max(0, currentSeconds - 1),
          )
        }, 1000)
    },
    [],
  )

  const scheduleInactivityTimers = useCallback(
    (lastActivity) => {
      if (!user) return

      clearInactivityTimers()
      setShowInactivityWarning(false)

      const inactivityLimit =
        user.role === 'admin'
          ? ADMIN_INACTIVITY_TIME
          : CLIENT_INACTIVITY_TIME

      const elapsedTime = Date.now() - lastActivity
      const remainingTime = inactivityLimit - elapsedTime

      if (remainingTime <= 0) {
        expireSession()
        return
      }

      const timeUntilWarning =
        remainingTime - WARNING_TIME

      if (timeUntilWarning <= 0) {
        startWarningCountdown(remainingTime)
      } else {
        warningTimeoutRef.current =
          window.setTimeout(() => {
            startWarningCountdown(WARNING_TIME)
          }, timeUntilWarning)
      }

      logoutTimeoutRef.current =
        window.setTimeout(
          expireSession,
          remainingTime,
        )
    },
    [
      user,
      clearInactivityTimers,
      expireSession,
      startWarningCountdown,
    ],
  )

  useEffect(() => {
    if (!user) {
      clearInactivityTimers()
      return undefined
    }

    let lastActivity = Number(
      localStorage.getItem(LAST_ACTIVITY_KEY),
    )

    if (
      !Number.isFinite(lastActivity) ||
      lastActivity <= 0
    ) {
      lastActivity = Date.now()

      localStorage.setItem(
        LAST_ACTIVITY_KEY,
        String(lastActivity),
      )
    }

    const initialScheduleId = window.setTimeout(() => {
      scheduleInactivityTimers(lastActivity)
    }, 0)

    const registerActivity = () => {
      if (warningVisibleRef.current) return

      const currentTime = Date.now()

      if (
        currentTime - lastActivityResetRef.current <
        1000
      ) {
        return
      }

      lastActivityResetRef.current = currentTime

      localStorage.setItem(
        LAST_ACTIVITY_KEY,
        String(currentTime),
      )

      scheduleInactivityTimers(currentTime)
    }

    const synchronizeActivity = (event) => {
      if (
        event.key !== LAST_ACTIVITY_KEY ||
        !event.newValue
      ) {
        return
      }

      const synchronizedTime = Number(event.newValue)

      if (Number.isFinite(synchronizedTime)) {
        scheduleInactivityTimers(synchronizedTime)
      }
    }

    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        registerActivity,
        { passive: true },
      )
    })

    window.addEventListener(
      'storage',
      synchronizeActivity,
    )

    return () => {
      window.clearTimeout(initialScheduleId)

      activityEvents.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          registerActivity,
        )
      })

      window.removeEventListener(
        'storage',
        synchronizeActivity,
      )

      clearInactivityTimers()
    }
  }, [
    user,
    scheduleInactivityTimers,
    clearInactivityTimers,
  ])

  const continueSession = () => {
    const currentTime = Date.now()

    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      String(currentTime),
    )

    setShowInactivityWarning(false)
    setWarningSeconds(60)

    scheduleInactivityTimers(currentTime)
  }

  const closeSessionNow = () => {
    logout()
    window.location.replace('/login')
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [token, user, loading, login, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}

      {showInactivityWarning && user && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            zIndex: 2000,
            background: 'rgba(0, 0, 0, 0.6)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="inactivity-title"
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              maxWidth: '460px',
              width: '100%',
            }}
          >
            <h2
              id="inactivity-title"
              className="h4 fw-bold"
            >
              Tu sesión está por cerrarse
            </h2>

            <p className="text-secondary">
              No detectamos actividad. La sesión se
              cerrará en:
            </p>

            <p className="display-6 fw-bold text-center">
              {warningSeconds} s
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2">
              <button
                type="button"
                className="btn btn-dark flex-grow-1"
                onClick={continueSession}
              >
                Continuar sesión
              </button>

              <button
                type="button"
                className="btn btn-outline-danger flex-grow-1"
                onClick={closeSessionNow}
              >
                Cerrar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
