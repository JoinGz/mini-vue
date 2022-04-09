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

  while (!isEnd(context)) {
    
    let node;
    if (context.sourse.startsWith(openDelimiter)) {
      node = parseInterpolation(context)
    } else if (context.sourse[0] === '<') {
      if (/[A-Z]/i.test(context.sourse[1])) {
        node = parseElement(context)
      }
    }
    
    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  
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

  const rowContent = parseTextData(context, rowContentLength)

  const content = rowContent.trim()
  
  advanceBy(context, closeDelimiter.length)
  
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

  element.children = parseChildren(context)

  parseTag(context, TagType.End)

  console.log(context.sourse)

  return element
}

function parseTag(context: { sourse: string; }, type: TagType): any {


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

function parseText(context: { sourse: string; }): any {

  let index = context.sourse.indexOf(openDelimiter)
  let endIndex = context.sourse.length
  if (index !== -1) {
    endIndex = index
  }


  const content = parseTextData(context, endIndex);
  

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData(context: { sourse: string; }, length: number) {
  const content = context.sourse.slice(0, length);

  advanceBy(context, length);

  // console.log(context.sourse);
  return content;
}

function isEnd(context: { sourse: string; }) {
  
  if (context.sourse.startsWith('</div>')) {
    return true
  }

  return !context.sourse
}

