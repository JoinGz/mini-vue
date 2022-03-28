import { h, renderSlot, createTextVNode } from '../../lib/index.esm.js'

export default {
  setup(props, { emit }) {},
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
