import { h } from '../../lib/index.esm.js'


export const helloWorld = {
  name: 'helloWorld',
  setup () {
    return {
      msg: 'p-one'
    }
  },
  render() {
    return h('div', { id: 'hello' }, [
      h('p', null, 'hi, mini-vue!'),
      h('div', null, [h('p', null, this.msg), h('p', null, 'p-two')]),
    ])
  },
}
