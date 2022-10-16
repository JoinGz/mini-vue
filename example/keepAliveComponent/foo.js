import { h, ref } from "../../lib/index.esm.js"

export default {
  setup (props, { emit }) {
    const num = ref(0)
    const add = () => {
      num.value = num.value+1
    }
    return {
      num,
      add
    }
  },
  render () {
    const p = h('p', {onClick: ()=>this.add()}, `click me to change num: ${this.num}`)
    return p
  }
}