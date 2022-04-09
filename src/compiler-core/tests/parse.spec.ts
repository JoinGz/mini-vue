import { NodeTypes } from "../src/nodeTypes"
import { baseParse } from "../src/parse"

describe('Parse', () => {
  test('{{}} parse', () => {
    const testTpl = '{{ message }}'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: "message",
      },
    })

  })
  test('element parse', () => {
    const testTpl = '<div></div>'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
    })

  })

  test('text parse', () => {
    const testTpl = 'some Text'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: 'some Text',
    })

  })

  test.only('three case parse', () => {
    const testTpl = '<div>Hi,{{message}}</div>'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'Hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          }
        }
      ]
    })

  })
})