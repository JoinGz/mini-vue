import { h, renderSlot, Fragment } from "../../lib/index.esm.js"

export default {
  name: 'keepAlive',
  setup () {
    
  },
  render () {
    const children = this.$slot
    const childrenVnode = Object.keys(children).map(key => {
      return renderSlot(children, key, )
    })
    return h(Fragment, null, childrenVnode)
  }
}