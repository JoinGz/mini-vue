import { Ast, nodeTypes } from './token2ast'
import { node } from './token2ast'

export function traverse(ast: Ast) {
  const context: any = {
    currentNode: null,
    parent: null,
    nodeTransfroms: [
      transformText
    ],
    replaceNode(node: node) {
      context.parent.child[context.currentNodeIndex] = node
      context.currentNode = node
    },
    removeNode() {
      context.parent.child.splice(context.currentNodeIndex, 1)
      context.currentNode = null
    }
  }

  traverseNode(ast, context)

}

function traverseNode(ast: Ast, context: any) {

  const exitFns = []
  context.currentNode = ast
  
  const nodeTransfroms = context.nodeTransfroms
  for (let i = 0; i < nodeTransfroms.length; i++) {
    const exitFn = nodeTransfroms[i](ast, context)
    if (exitFn) {
      exitFns.push(exitFn)
    }
    if (!context.currentNode) return
  }
  
  const child = ast.child
  if (child) {
    for (let i = 0; i < child.length; i++) {
      const nodeAst = child[i]
      context.parent = ast
      context.currentNodeIndex = i
      traverseNode(nodeAst, context)
    }
  }

  let exitFnsLength = exitFns.length
  while (exitFnsLength) {
    exitFns[--exitFnsLength]()
  }
}

function transformText(node: node, context: any) {
  if (node.type === nodeTypes.TEXT) {
    node.value = 'Gz'
  }
}
