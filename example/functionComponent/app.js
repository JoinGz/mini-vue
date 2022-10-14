import { h, ref, onMounted } from '../../lib/index.esm.js'

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
        h(
          function fc() {
            return h('div', null, 'function component')
          },
          { onClick: () => console.log('clicked') },
          this.count + '' /*render中判断的为string,才是子元素string类型*/
        ),
        h('div', null, 'div'),
      ]
    )
  },
}
