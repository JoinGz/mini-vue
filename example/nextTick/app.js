import { h, ref, nextTick } from '../../lib/index.esm.js'
import Child from './foo.js'

export const helloWorld = {
  name: 'App',
  setup() {
    const msg = ref('123')
    const count = ref(1)

    window.msg = msg

    const changeChildProps = () => {
      msg.value = '456'
    }

    const changeCount = () => {
      for (let i = 0; i < 5; i++) {
        count.value++    
      }
      nextTick(function () {
        console.log('nextTick');
      })
    }

    return { msg, changeChildProps, changeCount, count }
  },

  render() {
    return h('div', {}, [
      h('div', {}, '你好'),
      h(
        'button',
        {
          onClick: this.changeChildProps,
        },
        'change child props'
      ),
      h(Child, {
        msg: this.msg,
      }),
      h(
        'button',
        {
          onClick: this.changeCount,
        },
        'change self count'
      ),
      h('p', {}, 'count: ' + this.count),
    ])
  },
}
