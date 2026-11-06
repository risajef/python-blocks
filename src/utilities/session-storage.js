export function readSession(key) {
  try {
    return { value: typeof window === 'undefined' ? null : window.sessionStorage.getItem(key), error: '' }
  } catch {
    return { value: null, error: 'Session storage is unavailable. Editing works, but changes may not survive a reload.' }
  }
}

export function writeSession(key, value) {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value)
    return ''
  } catch {
    return 'Could not save this session. Editing works; copy your Python before closing the page.'
  }
}
