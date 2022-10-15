import { h } from "../../lib/index.esm.js"

export default {
  setup (props, {emit}) {
  },
  render () {
    const p = h('p', null, 'foo')
    return p
  }
}