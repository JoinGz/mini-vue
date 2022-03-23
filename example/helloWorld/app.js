import { h } from '../../lib/index.esm.js'

export const helloWorld = {
  name: 'helloWorld',
  setup() {},
  render() {
    return h('div', { id: 'hello' }, [
      h('p', null, 'hi, mini-vue!'),
      h('div', null, [h('p', null, 'p-one'), h('p', null, 'p-two')]),
    ])
  },
}
