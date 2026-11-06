import { childEdges, subtreeIds } from './block-tree.js'

export const MAX_SOURCE_LENGTH = 200_000
export const MAX_SNAPSHOT_LENGTH = 2_000_000
export const MAX_BLOCKS = 5000
export const MAX_DEPTH = 100

const isRecord = value => value && typeof value === 'object' && !Array.isArray(value)
const isId = value => typeof value === 'string' && value.length > 0
const fail = () => { throw new Error('Invalid or oversized block document.') }

export function validateDocument(document, definitions) {
  if (!isRecord(document) || !isRecord(document.blocks) || !Array.isArray(document.rootBody)) fail()
  const { blocks, rootBody } = document
  if (Object.keys(blocks).length > MAX_BLOCKS) fail()
  for (const [id, block] of Object.entries(blocks)) {
    if (!isRecord(block) || block.id !== id || !Object.hasOwn(definitions, block.type)) fail()
    if (!isRecord(block.slots) || !['body', 'elseBody', 'finallyBody', 'args', 'params', 'exceptHandlers', 'matchCases', 'importAliases', 'withAliases'].every(key => Array.isArray(block[key]))) fail()
    for (const key of ['value', 'name', 'op', 'annotation', 'alias', 'targetPattern', 'filterText']) {
      if (typeof block[key] !== 'string' || block[key].length > MAX_SOURCE_LENGTH) fail()
    }
    for (const key of ['showElse', 'showFinally', 'yieldFrom', 'tripleQuoted']) {
      if (typeof block[key] !== 'boolean') fail()
    }
    for (const key of ['params', 'importAliases', 'withAliases']) {
      if (!block[key].every(item => typeof item === 'string')) fail()
    }
    for (const key of ['body', 'elseBody', 'finallyBody']) if (!block[key].every(isId)) fail()
    if (!block.args.every(id => id === null || isId(id))) fail()
    const definition = definitions[block.type]
    if (block.body.length && (!definition.body || block.type === 'matchStmt')) fail()
    if (block.elseBody.length && !['if', 'try'].includes(block.type)) fail()
    if (block.finallyBody.length && block.type !== 'try') fail()
    if (block.exceptHandlers.length && block.type !== 'try') fail()
    if (block.matchCases.length && block.type !== 'matchStmt') fail()
    if (block.args.length && !definition.hasArgs || block.params.length && !definition.hasParams) fail()
    const slots = definition.slots
    if (Object.keys(block.slots).length !== slots.length || !slots.every(key => Object.hasOwn(block.slots, key))) fail()
    if (!Object.values(block.slots).every(id => id === null || isId(id))) fail()
    for (const item of block.exceptHandlers) {
      if (!isRecord(item) || typeof item.type !== 'string' || typeof item.alias !== 'string' || !Array.isArray(item.body) || !item.body.every(isId)) fail()
    }
    for (const item of block.matchCases) {
      if (!isRecord(item) || typeof item.pattern !== 'string' || typeof item.guard !== 'string' || !Array.isArray(item.body) || !item.body.every(isId)) fail()
    }
  }
  const visited = new Set()
  const pending = rootBody.map(id => ({ id, parentId: null, ctx: 'root', depth: 0 }))
  while (pending.length) {
    const { id, parentId, ctx, depth } = pending.pop()
    if (!isId(id) || visited.has(id) || !Object.hasOwn(blocks, id) || depth > MAX_DEPTH) fail()
    const block = blocks[id]
    if (block.parentId !== parentId || block.parentCtx !== ctx) fail()
    const statement = parentId === null || !ctx.startsWith('slot:') && !ctx.startsWith('arg:')
    if (definitions[block.type].stmt !== statement) fail()
    visited.add(id)
    for (const edge of childEdges(block)) pending.push({ ...edge, parentId: id, depth: depth + 1 })
  }
  if (visited.size !== Object.keys(blocks).length) fail()
  return document
}

export function documentSnapshot(state) {
  // Palette-created nodes may be temporarily unattached; persist only the program.
  const reachable = new Set(state.rootBody.flatMap(id => subtreeIds(state.blocks, id)))
  return {
    schemaVersion: 1,
    blocks: Object.fromEntries([...reachable].map(id => [id, state.blocks[id]])),
    rootBody: [...state.rootBody],
    simpleMode: state.simpleMode,
  }
}

export function validateDescriptors(descriptors) {
  const pending = descriptors.map(node => ({ node, depth: 0 }))
  let count = 0
  while (pending.length) {
    const { node, depth } = pending.pop()
    if (++count > MAX_BLOCKS || depth > MAX_DEPTH) fail()
    const children = [
      ...Object.values(node.slots || {}), ...(node.args || []),
      ...(node.body || []), ...(node.elseBody || []), ...(node.finallyBody || []),
      ...(node.exceptHandlers || []).flatMap(item => item.body || []),
      ...(node.matchCases || []).flatMap(item => item.body || []),
    ]
    for (const child of children) if (child) pending.push({ node: child, depth: depth + 1 })
  }
}
