import { tokenizen, tokenTypes } from './FSA'

describe('有限状态机', () => {
  test('开始标签', () => {
    const nodes = tokenizen(`<p>`)
    expect(nodes).toEqual([
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
    ])
  })
  test('文本', () => {
    const nodes = tokenizen(`vue`)
    expect(nodes).toEqual([
      {
        type: tokenTypes.TEXT,
        value: 'vue',
      },
    ])
  })

  test('结束标签', () => {
    const nodes = tokenizen(`</p>`)
    expect(nodes).toEqual([
      {
        type: tokenTypes.TAGEND,
        value: 'p',
      },
    ])
  })

  test('混合', () => {
    const nodes = tokenizen(`<p>vue</p>`)
    expect(nodes).toEqual([
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
    ])
  })

  test('混合嵌套', () => {
    const nodes = tokenizen(`<p>vue<div>test</div></p>`)
    expect(nodes).toEqual([
      {
        type: tokenTypes.TAGBEGIN,
        value: 'p',
      },
      {
        type: tokenTypes.TEXT,
        value: 'vue',
      },
      {
        type: tokenTypes.TAGBEGIN,
        value: 'div',
      },
      {
        type: tokenTypes.TEXT,
        value: 'test',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'div',
      },
      {
        type: tokenTypes.TAGEND,
        value: 'p',
      },
    ])
  })


  test('混合嵌套', () => {
    const nodes = tokenizen(`<div><p>Vue</p><p>Template</p></div>`)
    expect(nodes).toEqual([
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
    ])
  })

})
