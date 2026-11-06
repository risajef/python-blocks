import { documentSnapshot, validateDocument } from './document-validation.js'

function requiredSlots(block) {
  if (['sliceExpr', 'return', 'yieldStmt', 'yieldExpr', 'raiseStmt'].includes(block.type)) return []
  if (block.type === 'annAssign') return ['target']
  if (block.type === 'for') return block.slots.iterable ? ['var', 'iterable'] : ['var', 'start', 'end']
  if (['callStmt', 'callExpr'].includes(block.type)) return block.name ? [] : ['callee']
  return Object.keys(block.slots)
}

export function documentDiagnostics(state, definitions) {
  let snapshot
  try {
    snapshot = documentSnapshot(state)
    validateDocument(snapshot, definitions)
  } catch {
    return [{ code: 'invalid-document', message: 'The document has an invalid block or child reference. Repair it before running.' }]
  }
  const diagnostics = []
  for (const block of Object.values(snapshot.blocks)) {
    for (const slot of requiredSlots(block)) {
      if (!block.slots[slot]) diagnostics.push({ code: 'missing-expression', blockId: block.id, slot, message: `${definitions[block.type].label}: fill the ${slot} slot before running.` })
    }
    if (['rawStmt', 'rawExpr'].includes(block.type) && !block.value.trim()) {
      diagnostics.push({ code: 'empty-source', blockId: block.id, message: 'A raw block is empty.' })
    }
    if (block.yieldFrom && !block.slots.value) diagnostics.push({ code: 'missing-yield-value', blockId: block.id, message: 'yield from requires a value.' })
    if (block.type === 'withStmt' && !block.args.some(Boolean)) diagnostics.push({ code: 'missing-context', blockId: block.id, message: 'with requires a context manager.' })
    if (block.type === 'matchStmt' && !block.matchCases.length) diagnostics.push({ code: 'missing-case', blockId: block.id, message: 'match requires a case.' })
    if (block.type === 'try' && !block.exceptHandlers.length && !block.showFinally && !block.finallyBody.length) diagnostics.push({ code: 'missing-handler', blockId: block.id, message: 'try requires an except or finally block.' })
  }
  return diagnostics
}
