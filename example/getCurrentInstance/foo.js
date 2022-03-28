import { h, renderSlot, createTextVNode, getCurrentInstance } from '../../lib/index.esm.js'

export default {
  name: 'foo',
  setup (props, { emit }) {
    const instance = getCurrentInstance()
    console.log('foo-instance:', instance);
  },
  render() {
    const p = h('p', null, 'foo')
    return h('div', null, [
      renderSlot(this.$slot, 'header', { age: 18 }),
      createTextVNode('textNode'),
      p,
      renderSlot(this.$slot, 'footer'),
    ])
  },
}
