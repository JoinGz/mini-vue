import { NodeTypes } from "./nodeTypes";

export function baseParse(str: string) {
  // 创建一个 当前文本的 上下文
  const context = createParserContext(str)
  // 解析children
  return createRoot(parseChildren(context))

}

function createParserContext(str: string) {
  return {
    sourse: str
  }
}
function parseChildren(context: { sourse: string; }): any {

  const nodes = []

  const node = parseInterpolation(context)

  nodes.push(node)

  return nodes

  
}

function createRoot(children: any) {
  return {children}
}

function parseInterpolation(context: { sourse: string; }) {

  const closeDelimiter = "}}"
  const openDelimiter = "{{"

  // msg = "{{message}}"

  const closeIndex = context.sourse.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)
  
  const rowContentLength = closeIndex - openDelimiter.length

  const rowContent = context.sourse.slice(0, rowContentLength)

  const content = rowContent.trim()
  
  advanceBy(context, rowContentLength + closeDelimiter.length)
  
  console.log(context.sourse)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

function advanceBy(context: { sourse: string; }, num: number) {
  return context.sourse = context.sourse.slice(num)
}