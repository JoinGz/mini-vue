import { NodeTypes } from '../src/nodeTypes'
import { baseParse } from '../src/parse'

describe('Parse', () => {
  test('{{}} parse', () => {
    const testTpl = '{{ message }}'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'message',
      },
    })
  })
  test('element parse', () => {
    const testTpl = '<div a="1" ></div>'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      isSelfCloseTag: false,
      tag: 'div',
      children: [],
      props: [
        {
        name: "a",
        value: "\"1\""
      },
        {
        name: "b",
        value: "\"2\""
      },
      ],
    })
  })
  test('self close tag', () => {
    const testTpl = '<img />'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      isSelfCloseTag: true,
      tag: 'img',
      props: [],
    })
  })

  test('self close tag', () => {
    const testTpl = '<div><img /></div>'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      isSelfCloseTag: false,
      tag: 'div',
      props: [],

      children: [
        {
          type: NodeTypes.ELEMENT,
          isSelfCloseTag: true,
          tag: 'img',
          props: [],
        },
      ],
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

  test('three case parse', () => {
    const testTpl = '<div>Hi,{{message}}</div>'

    const ast = baseParse(testTpl)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      isSelfCloseTag: false,
      props: [],

      children: [
        {
          type: NodeTypes.TEXT,
          content: 'Hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    })
  })

  test('Nested element ', () => {
    const ast = baseParse('<div><p>hi</p>{{message}}</div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      isSelfCloseTag: false,
      props: [],

      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          isSelfCloseTag: false,
          props: [],

          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi',
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    })
  })

  test('should throw error when lack end tag', () => {
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrow(`缺少结束标签:span`)
  })
})
