import { effect } from '../src/effect'
import {isReactive, isReadOnly, reactive, readOnly} from '../src/reactive'

describe('reactive', () => {
  test('happy path', () => {
    const obj = { age: 1 }
    const proxyObj = reactive(obj)
    expect(proxyObj).not.toBe(obj)
    expect(proxyObj.age).toBe(1)

    expect(isReactive(proxyObj)).toBe(true)
    expect(isReactive(obj)).toBe(false)
    
  })
  
  test('readOnly', () => {
    const obj = { age: 1 } 
    const proxyObj = readOnly(obj)
    expect(proxyObj).not.toBe(obj)
    expect(proxyObj.age).toBe(1)
    
    console.warn = jest.fn()
    proxyObj.age = 2
    
    expect(console.warn).toBeCalled()
    
    expect(isReadOnly(proxyObj)).toBe(true)
    expect(isReadOnly(obj)).toBe(false)
  })

  test('reactive子对象判断', () => {
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}], someKey: {b: 6} } 
    const proxyObj = reactive(obj)

    expect(isReactive(proxyObj)).toBe(true)
    expect(isReactive(proxyObj.skill)).toBe(true)
    expect(isReactive(proxyObj.someKey)).toBe(true)
    expect(isReactive(proxyObj.skill[1])).toBe(true)

    let level;
    effect(() => {
      level = proxyObj.skill[1].piano + '1 '
    })

    expect(level).toBe('level51 ')
    
    proxyObj.skill[1].piano = 1
    
    expect(level).toBe('11 ')


  })

  test('readOnly子对象判断', () => {
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}], someKey: {b: 6} } 
    const proxyObj = readOnly(obj)

    expect(isReadOnly(proxyObj)).toBe(true)
    expect(isReadOnly(proxyObj.skill)).toBe(true)
    expect(isReadOnly(proxyObj.someKey)).toBe(true)
    expect(isReadOnly(proxyObj.skill[1])).toBe(true)
  })

  test.skip('reactive子对象依赖收集失败', () => {
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}], someKey: {b: 6} } 
    const proxyObj = reactive(obj)

    expect(isReactive(proxyObj)).toBe(true)
    expect(isReactive(proxyObj.skill)).toBe(true)
    expect(isReactive(proxyObj.someKey)).toBe(true)
    expect(isReactive(proxyObj.skill[1])).toBe(true)

    let level2;
    effect(() => {
      const xyz = proxyObj.skill
      level2 = proxyObj.skill = []
    })

    expect(level2).toHaveLength(0)
    
    proxyObj.skill = [1]
    
    expect(level2).toHaveLength(1)


  })
})