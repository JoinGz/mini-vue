import { h, ref, onMounted } from '../../lib/index.esm.js'
import keepAlive from "./keepAlive.js";
import foo from "./foo.js";
export const app = {
  name: 'app',
  setup() {
    onMounted(() => console.log(`app onMounted`))
    return {}
  },
  render() {
    return h(
      'div',
      {
        class: 'class',
      },
      [
        h(keepAlive, {}, { foo: () => h(foo, {}) }),
        h('p', null, 'test')
      ]
    )
  },
}
