// code generation

import { codegen } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"
import { transformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"

describe('code-generation', () => {
  test('hi string', () => {
    const ast = baseParse('hi')

    transform(ast)

    const {code} = codegen(ast)

    

    expect(code).toMatchSnapshot()

  })
  
  test('expression', () => {
    const ast = baseParse('{{message}}')

    transform(ast,{nodeTransforms: [transformExpression]})

    const {code} = codegen(ast)

    

    expect(code).toMatchSnapshot()

  })

  test.only('div', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')

    transform(ast,{nodeTransforms: [ transformExpression, transformElement, transformText]})

    const {code} = codegen(ast)

    

    expect(code).toMatchSnapshot()

  })
})