/** Share one in-flight/successful load, but allow retry after a failed attempt. */
export function retryableLoader(load) {
  let pending = null
  return () => {
    if (!pending) {
      const attempt = Promise.resolve().then(load).catch(error => {
        if (pending === attempt) pending = null
        throw error
      })
      pending = attempt
    }
    return pending
  }
}
