import { h, renderSlot } from '../../lib/index.esm.js'

export default {
  setup(props, { emit }) {},
  render() {
    const p = h('p', null, 'foo')
    return h('div', null, [
      renderSlot(this.$slot, 'header', {age: 18}),
      p,
      renderSlot(this.$slot, 'footer'),
    ])
  },
}
