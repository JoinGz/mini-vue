import {reactive, readOnly} from '../src/reactive'

describe('reactive', () => {
  test('happy path', () => {
    const obj = { age: 1 }
    const proxyObj = reactive(obj)
    expect(proxyObj).not.toBe(obj)
    expect(proxyObj.age).toBe(1)
  })
  
  test('readOnly', () => {
    const obj = { age: 1 } 
    const proxyObj = readOnly(obj)
    expect(proxyObj).not.toBe(obj)
    expect(proxyObj.age).toBe(1)

    console.warn = jest.fn()
    proxyObj.age = 2

    expect(console.warn).toBeCalled()

  })
})