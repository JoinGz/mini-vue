import { tokenTypes } from './FSA'
import { nodeTypes, token2Ast } from './token2ast'

describe('token2ast', () => {
  test('happy path', () => {
    const token = [
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
    ]

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
    const token = [
      {
        type: tokenTypes.TEXT,
        value: 'test',
      },
    ]

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
    const token = [
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
      {
        type: tokenTypes.TEXT,
        value: 'vue',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'p',
      },
    ]

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
    const token = [
      {
        type: tokenTypes.TAGBEGIN,
        value: 'div',
      },
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
      {
        type: tokenTypes.TEXT,
        value: 'Vue',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'p',
      },
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
      {
        type: tokenTypes.TEXT,
        value: 'Template',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'p',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'div',
      },
    ]

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
