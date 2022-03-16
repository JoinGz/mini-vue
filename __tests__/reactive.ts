import {reactive} from '../src/reactive'

describe('reactive', () => {
  test('happy path', () => {
    const obj = { age: 1 }
    const proxyObj = reactive(obj)
    expect(proxyObj).not.toBe(obj)
    expect(proxyObj.age).toBe(1)
  })
})