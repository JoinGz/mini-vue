import { h, ref, onMounted } from '../../lib/index.esm.js'
import keepAlive from "./keepAlive.js";
import foo from "./foo.js";
import foo2 from "./foo2.js";
export const app = {
  name: 'app',
  setup() {
    onMounted(() => console.log(`app onMounted`))
    const showFoo = ref(true)
    const changeShowFoo = () => {
      console.log(`keepAlive child component will change`)
      showFoo.value = !showFoo.value
    }
    return {showFoo, changeShowFoo}
  },
  render() {
    return h(
      'div',
      {
        class: 'class',
      },
      [
        h(keepAlive, {}, { default: () => this.showFoo ? h(foo, {})  : h(foo2, {})}),
        h('p', {onClick: this.changeShowFoo}, 'click me to change keepAlive child component')
      ]
    )
  },
}
