import { h, ref, onMounted, Teleport } from '../../lib/index.esm.js'

export const app = {
  name: 'app',
  setup() {
    const container = ref('#app2')

    const changeContainer = (name) => {
      container.value = name
      console.log(`container changed`)
    }
    return { container, changeContainer }
  },
  render() {
    return h('div', null, [
      h(
        'p',
        { onClick: () => this.changeContainer('#app3') },
        'teleport component test'
      ),
      h(
        Teleport,
        { to: this.container },
        this.container === '#app2'
          ? [h('div', null, 'Teleport componet children')]
          : [
              h('div', null, 'Teleport componet children'),
              h('div', null, 'Teleport2 componet2 children2'),
            ]
      ),
    ])
  },
}
