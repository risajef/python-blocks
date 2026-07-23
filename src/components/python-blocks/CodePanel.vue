<template>
  <aside class="code-panel" :class="{ 'code-panel--collapsed': isCollapsed }">
    <button
      v-if="isCollapsed"
      class="collapsed-toggle"
      data-testid="python-blocks-advanced-toggle"
      :aria-expanded="String(!isCollapsed)"
      title="Open nerd mode: generated Python and import tools"
      @click="togglePanel"
    >
      Nerd mode
    </button>

    <div v-show="!isCollapsed" class="code-shell">
      <div class="panel-header">
        <div>
          <div class="panel-title">Nerd mode</div>
          <div class="panel-subtitle">Generated Python and import tools</div>
        </div>
        <div class="panel-actions">
          <button class="copy-btn" data-testid="python-blocks-copy-output" @click="copy" :class="{ copied }">
            {{ copied ? '✓ Copied' : 'Copy code' }}
          </button>
          <button
            class="copy-btn ghost-btn"
            data-testid="python-blocks-advanced-hide"
            :aria-expanded="String(!isCollapsed)"
            @click="togglePanel"
          >
            Hide
          </button>
        </div>
      </div>

      <div class="section-shell import-panel">
        <div class="section-heading">Import Python into Python Blocks</div>
        <textarea
          v-model="importCode"
          class="import-input"
          data-testid="python-blocks-import-input"
          placeholder="Paste Python here, then click Import Python"
        ></textarea>
        <div class="import-actions">
          <button class="copy-btn" data-testid="python-blocks-import-run" @click="importPython">
            Import Python
          </button>
          <button class="copy-btn ghost-btn" @click="importCode = store.pythonCode">
            Use output
          </button>
        </div>
        <p class="import-help">
          Supported: assignments, print, input, while, for, if/else, try/except/finally, raise, with, match/case, def, class, lambda, return, break, continue, list/dict comprehensions, generator expressions in calls, calls, and basic expressions.
        </p>
        <p v-if="importError" class="import-error" data-testid="python-blocks-import-error">{{ importError }}</p>
        <p v-else-if="importSuccess" class="import-success" data-testid="python-blocks-import-success">{{ importSuccess }}</p>
      </div>

      <div class="section-shell output-panel">
        <div class="section-heading">Generated Python</div>
        <pre class="code-content">{{ store.pythonCode }}</pre>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { usePythonBlocksStore } from '../../store/python-blocks.js'

const PANEL_STATE_KEY = 'python-blocks-code-panel-collapsed'

const store = usePythonBlocksStore()
const copied = ref(false)
const importCode = ref('')
const importError = ref('')
const importSuccess = ref('')
const isCollapsed = ref(loadPanelState())

function loadPanelState() {
  if (typeof window === 'undefined') return true
  const persisted = window.sessionStorage.getItem(PANEL_STATE_KEY)
  return persisted === null ? true : persisted === 'true'
}

function persistPanelState() {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(PANEL_STATE_KEY, String(isCollapsed.value))
}

function togglePanel() {
  isCollapsed.value = !isCollapsed.value
  persistPanelState()
}

function copy() {
  navigator.clipboard.writeText(store.pythonCode).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  })
}

function importPython() {
  try {
    store.importPythonCode(importCode.value)
    importError.value = ''
    importSuccess.value = 'Imported Python into the canvas.'
  } catch (error) {
    importSuccess.value = ''
    importError.value = error instanceof Error ? error.message : 'Import failed.'
    console.error('[Python Blocks import] UI import failed. See parser diagnostics above for details.', error)
  }
}
</script>

<style scoped>
.code-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: min(420px, 34vw);
  min-width: 340px;
  background: #FFFFFF;
  border-left: 1px solid #888888;
  flex-shrink: 0;
  transition: width 0.22s ease, min-width 0.22s ease;
}
.code-panel--collapsed {
  width: 54px;
  min-width: 54px;
}
.collapsed-toggle {
  flex: 1;
  border: none;
  background: #F7F7F7;
  color: #555555;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.collapsed-toggle:hover {
  color: #8B0000;
  background: #F0F0F0;
}
.code-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #F7F7F7;
  color: #555555;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  border-bottom: 1px solid #E0E0E0;
}
.panel-title {
  color: #8B0000;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}
.panel-subtitle {
  color: #888888;
  font-size: 11px;
  letter-spacing: normal;
  text-transform: none;
}
.panel-actions {
  display: flex;
  gap: 8px;
}
.section-shell {
  padding: 12px;
  border-bottom: 1px solid #E0E0E0;
  background: #FFFFFF;
}
.section-shell.output-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.section-heading {
  margin-bottom: 8px;
  color: #1A1A1A;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.import-input {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid #888888;
  border-radius: 2px;
  background: #FFFFFF;
  color: #1A1A1A;
  padding: 10px;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  outline: none;
}
.import-input:focus {
  border-color: #8B0000;
}
.import-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.copy-btn {
  background: #F7F7F7;
  color: #555555;
  border: 1px solid #888888;
  border-radius: 2px;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.copy-btn:hover { background: #E0E0E0; }
.copy-btn.copied { background: #2E8B57; color: #fff; border-color: #2E8B57; }
.ghost-btn {
  background: #FFFFFF;
}
.copy-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.import-help,
.import-error,
.import-success {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
}
.import-help {
  color: #555555;
}
.import-error {
  color: #B22222;
}
.import-success {
  color: #2E8B57;
}
.code-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  margin: 0;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #1A1A1A;
  white-space: pre;
  border: 1px solid #888888;
  border-radius: 2px;
  background: #F7F7F7;
}
:deep(.runtime-target .xterm) {
  padding: 10px;
  height: 180px;
}
:deep(.runtime-target .xterm-viewport) {
  overflow-y: auto;
}
@media (max-width: 980px) {
  .code-panel {
    width: min(360px, 48vw);
    min-width: 280px;
  }
}
</style>
