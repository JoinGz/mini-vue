import { tokenizen } from './FSA'
import { token2Ast } from './token2ast'
import { traverse } from './traverse'

describe('traverse', () => {
  test('happy path', () => {
    const token = tokenizen('<div><p>Vue</p><p>Template</p></div>')

    const ast = token2Ast(token)

    traverse(ast)

  })
})
