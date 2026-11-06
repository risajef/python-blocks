/** Own one runner; completions from retired generations have no UI authority. */
export function createRuntimeSession(createRunner) {
  let generation = 0
  let runner = null
  let pending = null
  let disposed = false

  function reset() {
    generation += 1
    const previous = runner
    runner = null
    pending = null
    previous?.kill()
  }

  async function ensureRunner(token) {
    if (runner) return runner
    if (!pending) {
      const attempt = Promise.resolve().then(createRunner).then(instance => {
        if (disposed || token !== generation) {
          instance.kill()
          throw new Error('Runtime initialization cancelled.')
        }
        runner = instance
        return instance
      }).catch(error => {
        if (pending === attempt) pending = null
        throw error
      })
      pending = attempt
    }
    return pending
  }

  return {
    async run(source, onReady = () => {}) {
      if (disposed) throw new Error('Runtime session is disposed.')
      const token = generation
      try {
        const instance = await ensureRunner(token)
        if (token !== generation || disposed) return false
        onReady(instance)
        await instance.reset()
        if (token !== generation || disposed) return false
        await instance.process(source)
        return token === generation && !disposed
      } catch (error) {
        if (token !== generation || disposed) return false
        throw error
      }
    },
    async clear() {
      const token = generation
      await runner?.clear()
      return token === generation && !disposed
    },
    reset,
    dispose() { disposed = true; reset() },
  }
}
