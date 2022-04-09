import { NodeTypes } from "./nodeTypes";

const openDelimiter = "{{"
const closeDelimiter = "}}"

const enum TagType {
  Start,
  End,
}

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

  let node;
  if (context.sourse.startsWith(openDelimiter)) {
    node = parseInterpolation(context)
  } else if (context.sourse[0] === '<') {
    if (/[A-Z]/i.test(context.sourse[1])) {
      node = parseElement(context)
    }
  }


  nodes.push(node)

  return nodes

  
}

function createRoot(children: any) {
  return {children}
}

function parseInterpolation(context: { sourse: string; }) {



  // msg = "{{message}}"

  const closeIndex = context.sourse.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)
  
  const rowContentLength = closeIndex - openDelimiter.length

  const rowContent = context.sourse.slice(0, rowContentLength)

  const content = rowContent.trim()
  
  advanceBy(context, rowContentLength + closeDelimiter.length)
  
  // console.log(context.sourse)

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

function parseElement(context: { sourse: string; }): any {

  const element = parseTag(context, TagType.Start)

  parseTag(context, TagType.End)

  console.log(context.sourse)

  return element
}
function parseTag(context: { sourse: string; }, type: TagType) {
  const tagMatch = context.sourse.match(/^<\/?([A-Z]*)/i)
  const tag = tagMatch![1]

  advanceBy(context, tagMatch![0].length) // 前进到<div>的前面的<div
  advanceBy(context, 1) // 前进到<div>的最后的>

  if (type === TagType.End) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

