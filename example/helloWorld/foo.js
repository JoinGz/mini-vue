import { h } from "../../lib/index.esm.js"

export default {
  setup (props, {emit}) {
    console.log(`props: ${props}`)
    const click = () => {
      console.log('clicked-foo');
      emit('add', 1, 2)
      emit('add-foo', 1, 2)
    }
    return {
      click
    }
  },
  render () {
    const p = h('p', null, 'foo:' + this.count)
    const btn = h('button', {
      onClick: this.click
    }, 'emitBtn')
    const input = h('input', {disabled: ""}, 'button')
    return h('div', null, [p, btn, input])
  }
}