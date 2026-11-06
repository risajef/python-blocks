import { retryableLoader } from './retryable-loader.js'

const PYSCRIPT_VERSION = '0.7.19'
const PYSCRIPT_BASE_URL = `https://cdn.jsdelivr.net/npm/@pyscript/core@${PYSCRIPT_VERSION}/dist`
const PYSCRIPT_CORE_URL = `${PYSCRIPT_BASE_URL}/core.js`
const PYSCRIPT_CSS_URL = `${PYSCRIPT_BASE_URL}/core.css`
const PYSCRIPT_STYLE_ID = 'python-blocks-pyscript-core-css'

const loadCore = retryableLoader(() => import(/* @vite-ignore */ PYSCRIPT_CORE_URL))

function ensureBrowserContext() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('PyScript can only run in the browser.')
    }
}

export const ensurePyScriptStylesheet = retryableLoader(() => {
    ensureBrowserContext()
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(PYSCRIPT_STYLE_ID)
        if (existing?.sheet) {
            resolve(existing)
            return
        }
        const link = existing || document.createElement('link')
        link.id = PYSCRIPT_STYLE_ID
        link.rel = 'stylesheet'
        link.href = PYSCRIPT_CSS_URL
        const cleanup = () => {
            link.removeEventListener('load', loaded)
            link.removeEventListener('error', failed)
        }
        const loaded = () => { cleanup(); resolve(link) }
        const failed = () => {
            cleanup()
            link.remove()
            reject(new Error('Could not load the PyScript stylesheet. Retry Run to try again.'))
        }
        link.addEventListener('load', loaded, { once: true })
        link.addEventListener('error', failed, { once: true })
        if (!existing) document.head.append(link)
    })
})

async function loadCoreModule() {
    ensureBrowserContext()
    await ensurePyScriptStylesheet()
    return loadCore()
}

// Worker-backed terminals need a cross-origin-isolated context.
function supportsWorkerTerminal() {
    return typeof SharedArrayBuffer === 'function' && window.crossOriginIsolated === true
}

export function createWorkerRunner(donkey, options) {
    return donkey({
        type: 'py',
        persistent: false,
        ...options,
    }).then((runner) => ({
        mode: 'worker',
        reset: (...args) => runner.reset(...args),
        process: (...args) => runner.process(...args),
        clear: (...args) => runner.clear(...args),
        kill: (...args) => runner.kill(...args),
    }))
}

export async function createPyScriptRunner(options = {}) {
    ensureBrowserContext()
    if (!supportsWorkerTerminal()) {
        throw new Error('Python execution requires cross-origin isolation and a worker. Open the editor on a host with COOP/COEP headers; main-thread execution is disabled to keep the editor responsive.')
    }
    const { donkey } = await loadCoreModule()
    return createWorkerRunner(donkey, options)
}
