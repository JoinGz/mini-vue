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
})