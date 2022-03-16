import {track, trigger} from '../src/effect'

export function reactive(row: { [key: string]: any }) {
  return new Proxy(row, {
    get: function (org, key) {
      const result  = Reflect.get(org, key)
      track(org, key)
      return result
    },
    set: function (org, key, value) {
      const reuslt = Reflect.set(org, key, value)
      trigger(org, key)
      return reuslt
    }
  })
}
