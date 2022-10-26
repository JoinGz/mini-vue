import { anyFunction } from '../../reactivity/watch';
import { NodeTypes } from './nodeTypes'

const openDelimiter = '{{'
const closeDelimiter = '}}'

const enum TagType {
  Start,
  End,
}

const enum TEXTMODEL  {
  "DATA" = 'DATA',
  "RCDATA" = 'RCDATA',
  "RAWTEXT" = 'RAWTEXT',
  "CDATA" = 'CDATA',
}

type context = {
  sourse: string;
  model: TEXTMODEL;
  advanceSpace: anyFunction
}

type element = {
  type: NodeTypes
  tag: string
  isSelfCloseTag: boolean
  props: []
  children?: []
}

export function baseParse(str: string) {
  // 创建一个 当前文本的 上下文
  const context = createParserContext(str)
  // 解析children
  return createRoot(parseChildren(context, []))
}

function createParserContext(str: string) {
  const context: context = {
    sourse: str,
    model: TEXTMODEL.DATA,
    advanceSpace() {
      const space = context.sourse.match(/^[\t\r\n\f\s]+/)
      if (space) {
        context.sourse = context.sourse.slice(space[0].length)
      }
    }
  }
  return context
}
function parseChildren(context: context, ancestors: string[]): any {
  const nodes = []

  while (!isEnd(context, ancestors)) {
    let node

    switch (context.model) {
      case TEXTMODEL.DATA:
        if (context.sourse.startsWith(openDelimiter)) {
          node = parseInterpolation(context)
        } else if (context.sourse[0] === '<') {
          // tag open
          if (/[A-Z]/i.test(context.sourse[1])) {
            node = parseElement(context, ancestors)
          } else if (context.sourse.startsWith('<!--')) {
            // 注释
            // node = parseComment(context)
          } else if (context.sourse.startsWith('<![CDATA[')) {
            // node = parseCDATA(context, ancestors)
          } else if (context.sourse[1] === '/') {
            // 结束标签
            console.error(`缺少开始标签`)
          }
        } else if (context.sourse[0] === '&') {
          // 实体字符
        }

        break
      case TEXTMODEL.RCDATA:
        if (context.sourse.startsWith(openDelimiter)) {
          node = parseInterpolation(context)
        } else if (context.sourse[0] === '&') {
          // 实体字符
        }

        break

      default: /** RAWTEXT || CDATA */
        
        break
    }

    

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

function createRoot(children: any) {
  return { children, type: NodeTypes.ROOT }
}

function parseInterpolation(context: context) {
  // msg = "{{message}}"

  const closeIndex = context.sourse.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

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

function advanceBy(context: context, num: number) {
  return (context.sourse = context.sourse.slice(num))
}

function parseElement(context: context, ancestors: string[]): any {
  const element = parseTag(context, TagType.Start) as element

  if (element.isSelfCloseTag) return element
  
  changeMode(context, element)

  ancestors.push(element.tag)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (startsWithEndTagOpen(context, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签:${element.tag}`)
  }

  console.log(context.sourse)

  return element
}

function parseTag(context: context, type: TagType) {
  const tagMatch = context.sourse.match(/^<\/?([A-Z]*)/i)
  const tag = tagMatch![1]

  advanceBy(context, tagMatch![0].length) // 前进到<div>的前面的<div
  context.advanceSpace()
  
  const props = parseProps(context)

  const isSelfCloseTag = context.sourse.startsWith('/>')
  advanceBy(context, isSelfCloseTag ? 2 : 1) // 前进到<div>的最后的>

  if (type === TagType.End) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
    isSelfCloseTag,
    props: props
  }
}

function parseText(context: context): any {
  let endIndex = context.sourse.length

  const endTokens = ['<', openDelimiter]

  for (let i = 0; i < endTokens.length; i++) {
    const tokens = endTokens[i]
    let index = context.sourse.indexOf(tokens)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData(context: context, length: number) {
  const content = context.sourse.slice(0, length)

  advanceBy(context, length)

  // console.log(context.sourse);
  return content
}

function isEnd(context: context, ancestors: string[]) {
  if (context.sourse.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i]
      if (startsWithEndTagOpen(context, tag)) {
        return true
      }
    }
  }

  return !context.sourse
}

function startsWithEndTagOpen(context: context, tag: string) {
  return (
    context.sourse.startsWith('</') &&
    context.sourse.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
}
function changeMode(context: context, element: element) {
  if (['textarea', 'title'].includes(element.tag)) {
    context.model = TEXTMODEL.RCDATA
  } else if (["style", "xmp", "iframe", "noembed", "noframes", "noscript"].includes(element.tag)) {
    context.model = TEXTMODEL.RAWTEXT
  } else {
    context.model = TEXTMODEL.DATA
  }
}

function parseProps(context: context) {
  // a=1 b=2>
  // a=1 b=2/>

  let key;
  const reuslt = []

  while (context.sourse) {
    if (context.sourse.startsWith('/>') || context.sourse.startsWith('>')) {
      break;
    }
    let name = context.sourse.match(/^[^=]+/) as any
    if (name) {
      advanceBy(context, name[0].length)
      name = name[0].trim()
      context.advanceSpace()
      let value = context.sourse.match(/^=([^\s\r\n\f>]+)/) as any
      if (value) {
        advanceBy(context, value[0].length)
        value = value[1].trim()
      context.advanceSpace()
        
      }
      reuslt.push({name,value})
    }
  }

  

  return reuslt

}

