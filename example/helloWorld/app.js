import { h } from '../../lib/index.esm.js'

export const helloWorld = {
  name: 'helloWorld',
  setup() {},
  render() {
    return h('div', { id: 'hello' }, [h('hello-world')])
  },
}


