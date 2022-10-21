import { tokenTypes } from './FSA'
import { nodeTypes, token2Ast } from './token2ast'
import { tokenizen } from "./FSA";

describe('token2ast', () => {
  test('happy path', () => {
    const token = tokenizen('<p>')

    const ast = token2Ast(token)

    expect(ast).toEqual({
      type: nodeTypes.ROOT,
      child: [
        {
          type: nodeTypes.ELEMET,
          value: 'p',
          child: [],
        },
      ],
    })
  })

  test('文本', () => {
    const token = tokenizen('test')

    const ast = token2Ast(token)

    expect(ast).toEqual({
      type: nodeTypes.ROOT,
      child: [
        {
          type: nodeTypes.TEXT,
          value: 'test',
        },
      ],
    })
  })

  test('<p>vue</p>', () => {
    const token = tokenizen('<p>vue</p>')

    const ast = token2Ast(token)

    expect(ast).toEqual({
      type: nodeTypes.ROOT,
      child: [
        {
          type: nodeTypes.ELEMET,
          value: 'p',
          child: [
            {
              type: nodeTypes.TEXT,
              value: 'vue',
            },
          ],
        },
      ],
    })
  })
  test('<div><p>Vue</p><p>Template</p></div>', () => {
    const token = tokenizen('<div><p>Vue</p><p>Template</p></div>')

    const ast = token2Ast(token)

    expect(ast).toEqual({
      type: nodeTypes.ROOT,
      child: [
        {
          type: nodeTypes.ELEMET,
          value: 'div',
          child: [
            {
              type: nodeTypes.ELEMET,
              value: 'p',
              child: [
                {
                  type: nodeTypes.TEXT,
                  value: 'Vue',
                },
              ],
            },
            {
              type: nodeTypes.ELEMET,
              value: 'p',
              child: [
                {
                  type: nodeTypes.TEXT,
                  value: 'Template',
                },
              ],
            },
          ],
        },
      ],
    })
  })
})
