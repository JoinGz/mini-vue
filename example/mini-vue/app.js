
import { ref } from '../../lib/index.esm.js'


export const helloWorld = {
  name: 'helloWorld',
  setup () {
    window.ref = ref(1)
    return {
      msg: window.ref,
    }
  },
  template: '<div>hi,{{msg}}</div>'
}
