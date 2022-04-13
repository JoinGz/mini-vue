import { NodeTypes } from './nodeTypes'
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from './runtimehelpers'


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
  
  push(`return `)
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
    case NodeTypes.ELEMENT:
      genElement(ast, codegenContext)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genComExp(ast, codegenContext)
      break

    default:
      break
  }
}

function genTextNode(
  ast: any,
  codegenContext: codegenContext
) {
  codegenContext.push(`'${ast.content}'`)
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
  push(`${helps(TO_DISPLAY_STRING)}(`)
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


function genElement(ast: any, codegenContext: codegenContext) {
  const { push, helps } = codegenContext
  push(`${helps(CREATE_ELEMENT_VNODE)}('${ast.tag}', null, `)
  for (let i = 0; i < ast.children.length; i++) {
    const children = ast.children[i];
    // 处理+号问题，通过新增一种COMPOUND_EXPRESSION类型来处理，把相邻是字符串的放入这个类型中，然后循环增加数组
    genNode(children, codegenContext)
  }
  push(`)`)
}

function genComExp(ast: any, codegenContext: codegenContext) {
  const { children } = ast
  const { push } = codegenContext
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      push(children[i])
    } else {
      genNode(children[i], codegenContext)
    }
    
  }
}
