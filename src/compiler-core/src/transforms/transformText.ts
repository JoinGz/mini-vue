import { NodeTypes } from '../nodeTypes'
import { CREATE_ELEMENT_VNODE } from '../runtimehelpers'

export function transformText(ast: any, context: any) {
  return () => {
    if (ast.type === NodeTypes.ELEMENT) {
      context.addHelp(CREATE_ELEMENT_VNODE)

      const { children } = ast

      let init

      for (let i = 0; i < children.length; i++) {
        const astNode = children[i]
        if (isText(astNode)) {
          for (let j = i + 1; j < children.length; j++) {
            const nextAstNode = children[j]
            if (isText(nextAstNode)) {
              if (!init) {
                init = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [astNode],
                }
              }

              init.children.push(' + ')
              init.children.push(nextAstNode)
              children.splice(j, 1)
              j--
            } else {
              init = null
              break
            }
          }
        }
      }
    }
  }
}

function isText(ast: any) {
  return ast.type === NodeTypes.INTERPOLATION || ast.type === NodeTypes.TEXT
}
