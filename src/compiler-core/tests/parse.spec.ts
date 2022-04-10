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
      children:[]
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

  test("Nested element ", () => {
 
    const ast = baseParse("<div><p>hi</p>{{message}}</div>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  test("should throw error when lack end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");  
    }).toThrow(`缺少结束标签:span`);
  });

})