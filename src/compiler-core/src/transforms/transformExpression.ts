import { NodeTypes } from "../nodeTypes";


export function transformExpression(ast: any) {
  if (ast.type === NodeTypes.INTERPOLATION) {
    processExpression(ast.content)
  }
}

function processExpression(ast: any): any {
  ast.content = `_ctx.${ast.content}`
}
