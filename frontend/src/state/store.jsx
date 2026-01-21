import React, { createContext, useReducer, useContext, useMemo } from 'react';

// Centralized app state using Context + useReducer
// Non-invasive: can coexist with existing AuthContext and NotificationContext.

const initialState = {
  // Session/meta
  authReady: false,
  csrfToken: null,

  // UI state
  ui: {
    sidebarOpen: true,
    theme: 'light',
    loading: false,
    toasts: [], // { id, type, title, message, ttl }
  },

  // Entities (normalized placeholders)
  entities: {
    users: {},
    tasks: {},
    leaves: {},
    notifications: {},
  },

  // Request tracking
  requests: {
    // key -> { inFlight: bool, error: string|null, lastAt: number }
  },
};

// Actions
export const actions = {
  setAuthReady: (ready) => ({ type: 'AUTH_READY', ready }),
  setCsrfToken: (token) => ({ type: 'SET_CSRF_TOKEN', token }),

  // UI
  toggleSidebar: () => ({ type: 'UI_TOGGLE_SIDEBAR' }),
  setTheme: (theme) => ({ type: 'UI_SET_THEME', theme }),
  setLoading: (loading) => ({ type: 'UI_SET_LOADING', loading }),
  addToast: (toast) => ({ type: 'UI_ADD_TOAST', toast }),
  removeToast: (id) => ({ type: 'UI_REMOVE_TOAST', id }),
  clearToasts: () => ({ type: 'UI_CLEAR_TOASTS' }),

  // Requests
  requestStart: (key) => ({ type: 'REQ_START', key }),
  requestEnd: (key, error = null) => ({ type: 'REQ_END', key, error }),

  // Entities (generic upsert/remove)
  upsertEntity: (slice, entity) => ({ type: 'ENTITY_UPSERT', slice, entity }),
  removeEntity: (slice, id) => ({ type: 'ENTITY_REMOVE', slice, id }),
};

function reducer(state, action) {
  switch (action.type) {
    case 'AUTH_READY':
      return { ...state, authReady: !!action.ready };
    case 'SET_CSRF_TOKEN':
      return { ...state, csrfToken: action.token || null };

    // UI
    case 'UI_TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    case 'UI_SET_THEME':
      return { ...state, ui: { ...state.ui, theme: action.theme || 'light' } };
    case 'UI_SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: !!action.loading } };
    case 'UI_ADD_TOAST': {
      const toast = action.toast || {};
      const id = toast.id || (Date.now() + Math.random().toString(36).slice(2, 8));
      return { ...state, ui: { ...state.ui, toasts: [{ ...toast, id }, ...state.ui.toasts] } };
    }
    case 'UI_REMOVE_TOAST':
      return { ...state, ui: { ...state.ui, toasts: state.ui.toasts.filter(t => t.id !== action.id) } };
    case 'UI_CLEAR_TOASTS':
      return { ...state, ui: { ...state.ui, toasts: [] } };

    // Requests
    case 'REQ_START':
      return {
        ...state,
        requests: {
          ...state.requests,
          [action.key]: { inFlight: true, error: null, lastAt: Date.now() },
        },
      };
    case 'REQ_END':
      return {
        ...state,
        requests: {
          ...state.requests,
          [action.key]: { inFlight: false, error: action.error || null, lastAt: Date.now() },
        },
      };

    // Entities
    case 'ENTITY_UPSERT': {
      const { slice, entity } = action;
      if (!slice || !entity || !entity.id) return state;
      return {
        ...state,
        entities: {
          ...state.entities,
          [slice]: {
            ...(state.entities[slice] || {}),
            [entity.id]: { ...(state.entities[slice]?.[entity.id] || {}), ...entity },
          },
        },
      };
    }
    case 'ENTITY_REMOVE': {
      const { slice, id } = action;
      if (!slice || !id) return state;
      const nextSlice = { ...(state.entities[slice] || {}) };
      delete nextSlice[id];
      return { ...state, entities: { ...state.entities, [slice]: nextSlice } };
    }

    default:
      return state;
  }
}

const StateContext = createContext(undefined);
const DispatchContext = createContext(undefined);

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => state, [state]);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={value}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(StateContext);
  if (ctx === undefined) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(DispatchContext);
  if (ctx === undefined) throw new Error('useAppDispatch must be used within AppStateProvider');
  return ctx;
}

// Selectors (example)
export const selectors = {
  isLoading: (s) => !!s.ui.loading,
  theme: (s) => s.ui.theme,
  sidebarOpen: (s) => !!s.ui.sidebarOpen,
  csrfToken: (s) => s.csrfToken,
  request: (s, key) => s.requests[key] || { inFlight: false, error: null },
};
