/** Enumerate owned children in the same vocabulary used by the editor. */
export function childEdges(block) {
  const edges = []
  for (const [key, id] of Object.entries(block?.slots || {})) {
    if (id) edges.push({ id, ctx: `slot:${key}` })
  }
  for (const key of ['body', 'elseBody', 'finallyBody', 'args']) {
    for (const [index, id] of (block?.[key] || []).entries()) {
      if (id) edges.push({ id, ctx: key === 'args' ? `arg:${index}` : key })
    }
  }
  for (const [key, prefix] of [['exceptHandlers', 'exceptBody'], ['matchCases', 'matchCase']]) {
    for (const [index, item] of (block?.[key] || []).entries()) {
      for (const id of item.body || []) {
        if (id) edges.push({ id, ctx: `${prefix}:${index}` })
      }
    }
  }
  return edges
}

/** Iterative and bounded by document size, even for malformed cyclic input. */
export function subtreeIds(blocks, rootId) {
  const visited = new Set()
  const pending = [rootId]
  while (pending.length) {
    const id = pending.pop()
    if (visited.has(id)) continue
    visited.add(id)
    for (const edge of childEdges(blocks[id])) pending.push(edge.id)
  }
  return [...visited]
}
