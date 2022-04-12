import { NodeTypes } from './nodeTypes'
import { helperMapName, TO_DISPLAY_STRING } from './runtimehelpers'


type codegenContext =  {
  code: string
  push(source: string): void
  helps: (str: any) => any
}

export function codegen(ast: any) {
  const functionName = `render`
  const codegenContext = createCodegenContext(ast)
  const { push } = codegenContext

  genFunctionPreamble(ast, codegenContext)

  push(`return `)
  const arg = ['_ctx']
  const argStr = arg.join(', ')

  push(`function`)
  push(` ${functionName} (${argStr}){`)

  genNode(ast.codegenNode, codegenContext)

  push('}')

  return {
    code: codegenContext.code,
  }
}

function createCodegenContext(ast: any) {
  const context = {
    code: '',
    push(source: string) {
      context.code += source
    },
    helps(key: string) {
      return `_${helperMapName[key]}`
    },
  }
  return context
}
function genNode(
  ast: any,
  codegenContext: codegenContext
) {
  switch (ast.type) {
    case NodeTypes.TEXT:
      genTextNode(ast, codegenContext)
      break
    case NodeTypes.INTERPOLATION:
      genInsertNode(ast, codegenContext)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(ast, codegenContext)
      break

    default:
      break
  }
}

function genTextNode(
  ast: any,
  codegenContext: codegenContext
) {
  codegenContext.push(`return '${ast.content}'`)
}

function genFunctionPreamble(
  ast: any,
  codegenContext: codegenContext
) {
  // if (ast.children[0].type === NodeTypes.INTERPOLATION) {
    const vueBinging = `Vue`
    const { push } = codegenContext
    const { helps } = ast
    const astadd_ = (s: string) => `${helperMapName[s]}: _${helperMapName[s]}`

    if (helps.length) {
      push(`const { ${helps.map(astadd_).join(',')} } = ${vueBinging}`)
      push('\n')
    }
  // }
}

function genInsertNode(
  ast: any,
  codegenContext: {
    code: string
    push(source: string): void
    helps: (str: any) => any
  }
) {
  const { push, helps } = codegenContext
  push(`return ${helps(TO_DISPLAY_STRING)}(`)
  genNode(ast.content, codegenContext)
  push(`)`)
}

function genExpression(
  ast: any,
  codegenContext: codegenContext
) {
  const { push } = codegenContext
  push(`${ast.content}`)
}
