import { createTextVNode, h, inject, provide } from '../../lib/index.esm.js'


const fooTwo = {
  name: 'foo-two',
  setup () {
    const foo = inject('foo')
    const bar = inject('bar', () => 'bar-default')
    const defaultText = inject('defaultText', ()=>'defaultText')
    return {
      foo,
      bar,
      defaultText
    }
  },
  render() {
    return h('div', null, this.foo + ' '+ this.bar + ' ' + this.defaultText)
  },
}

export default {
  name: 'foo',
  setup () {
    provide('foo', 'foo-foo')
    const foo = inject('foo')
    return {
      foo
    }
  },
  render() {
    return h('div', null, [createTextVNode(this.foo), h(fooTwo)])
  },
}
