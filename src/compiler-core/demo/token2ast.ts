import { tokenTypes } from './FSA'

export enum nodeTypes {
  ELEMET,
  TEXT,
  ROOT,
}

interface token {
  type: tokenTypes
  value: string
}

interface node {
  type: nodeTypes
  value: string
  child?: node[]
}

export function token2Ast(token: token[]) {
  let item = token.shift()
  const ast: { type: nodeTypes; child?: node[] } = {
    type: nodeTypes.ROOT,
    child: [],
  }
  const elementStack = [ast]

  while (item) {
    const parent = elementStack[elementStack.length - 1]
    const node = {} as node
    if (item.type === tokenTypes.TAGBEGIN) {
      node.type = nodeTypes.ELEMET
      node.value = item.value
      node.child = []
      parent.child!.push(node)
      elementStack.push(node)
      item = token.shift()
      continue
    }
    if (item.type === tokenTypes.TAGEND) {
      elementStack.pop()
      item = token.shift()
      continue
    }
    if (item.type === tokenTypes.TEXT) {
      parent.child!.push(node)
      node.type = nodeTypes.TEXT
      node.value = item.value
      item = token.shift()
      continue
    }
    break
  }

  return ast
}
