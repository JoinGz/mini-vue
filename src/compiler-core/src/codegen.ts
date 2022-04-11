export function codegen(ast: any) {

  const functionName = `render`
  const codegenContext = createCodegenContext(ast)
  const { push } = codegenContext
  push(`return `)
  const arg = ["_ctx"]
  const argStr = arg.join(', ')


  push(`fucntion`)
  push(` ${functionName} (${argStr}){`)

  genNode(ast, codegenContext)

  push('}')

  return {
    code: codegenContext.code
  }
}

function createCodegenContext(ast: any) {
  const context =  {
    code: '',
    push(source: string) {
      context.code += source
    }
  }
  return context
}
function genNode(ast: any, codegenContext: { code: string; push(source: string): void }) {
  const node = ast.codegenNode
  codegenContext.push(`return '${node.content}'`)
}

