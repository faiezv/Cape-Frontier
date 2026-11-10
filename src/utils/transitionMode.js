import { useSyncExternalStore } from 'react'

const KEY = 'pageTransitionMode'
const DEFAULT_MODE = 'curtain' // any key registered in transitions/index.js
const listeners = new Set()

const read = () => {
  try {
    return localStorage.getItem(KEY) || DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

export const setTransitionMode = (mode) => {
  try {
    localStorage.setItem(KEY, mode)
  } catch {}
  listeners.forEach((l) => l())
}

export const toggleTransitionMode = () =>
  setTransitionMode(read() === 'curtain' ? 'fade' : 'curtain')

const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

// Server snapshot is always the default, so prerendered HTML never differs.
export const useTransitionMode = () =>
  useSyncExternalStore(subscribe, read, () => DEFAULT_MODE)

// Toggle on command from the browser console:
//   setPageTransition('fade')   setPageTransition('curtain')   togglePageTransition()
if (typeof window !== 'undefined') {
  window.setPageTransition = setTransitionMode
  window.togglePageTransition = toggleTransitionMode
}