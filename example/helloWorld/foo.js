import { h } from "../../lib/index.esm.js"

export default {
  setup (props) {
    console.log(props)
  },
  render () {
    return h('div', null, 'foo:' + this.count)
  }
}