import { h, ref } from '../../lib/index.esm.js'
import foo from './foo.js'

export const app = {
  name: 'app',
  setup () {
    const count = ref(0)

    const onAddCount = () => {
      count.value++
    }

    return {
      count,
      msg: 'p-one',
      onAddCount,
    }
  },
  render() {
    return h(
      'div',
      {
        id: 'hello',
      },
      [
        h('p', { onClick: () => console.log('clicked') }, this.count),
        h('button', {onClick: () => this.onAddCount()}, 'changeCount'),
        h(foo, {
          count: 1,
          onAdd() {
            console.log(`emit->add`, ...arguments)
          },
          onAddFoo() {
            console.log(`emit->add-foo`, ...arguments)
          },
        }),
      ]
    )
  },
}
