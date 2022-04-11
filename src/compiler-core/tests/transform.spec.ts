import { NodeTypes } from "../src/nodeTypes"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('transform', () => {
  test('text-node', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')

    const plugin = (node: any) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + 'mini-vue'
      } 
    }

    transform(ast, {
      nodeTransforms: [
        plugin
      ]
    })

    const textNode = ast.children[0].children[0]

    expect(textNode.content).toBe('hi,mini-vue')

  })
})