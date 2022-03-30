import { h, ref } from '../../lib/index.esm.js'

import { array2Text } from './array2text.js'
import { text2array } from './text2array.js'
import { text2text } from './text2text.js'
import { array2array } from './array2array.js'

export const app = {
  name: 'app',
  setup() {},
  render() {
    return h(
      'div',
      {
        class: 'class',
      },
      [
        // h(text2array)
        // h(array2Text)
        // h(text2text)
        h(array2array)
      ]
    )
  },
}
