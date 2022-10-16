import { h, ref } from "../../lib/index.esm.js"

export default {
  name: 'foo2',
  setup (props, { emit }) {
    return {
    }
  },
  render () {
    const p = h('h1', {}, `f002`)
    return p
  }
}