import { tokenizen } from './FSA'

describe('有限状态机', () => {
  test('开始标签', () => {
    const nodes = tokenizen(`<p>`)
    expect(nodes).toEqual([
      {
        type: 'tag',
        value: 'p',
      },
    ])
  })
  test('文本', () => {
    const nodes = tokenizen(`vue`)
    expect(nodes).toEqual([
      {
        type: 'text',
        value: 'vue',
      },
    ])
  })

  test('结束标签', () => {
    const nodes = tokenizen(`</p>`)
    expect(nodes).toEqual([
      {
        type: 'tagEnd',
        value: 'p',
      },
    ])
  })

  test('混合', () => {
    const nodes = tokenizen(`<p>vue</p>`)
    expect(nodes).toEqual([
      {
        type: 'tag',
        value: 'p',
      },
      {
        type: 'text',
        value: 'vue',
      },
      {
        type: 'tagEnd',
        value: 'p',
      },
    ])
  })

  test('混合嵌套', () => {
    const nodes = tokenizen(`<p>vue<div>test</div></p>`)
    expect(nodes).toEqual([
      {
        type: 'tag',
        value: 'p',
      },
      {
        type: 'text',
        value: 'vue',
      },
      {
        type: 'tag',
        value: 'div',
      },
      {
        type: 'text',
        value: 'test',
      },
      {
        type: 'tagEnd',
        value: 'div',
      },
      {
        type: 'tagEnd',
        value: 'p',
      },
    ])
  })
})
