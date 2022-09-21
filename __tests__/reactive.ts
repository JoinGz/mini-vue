import { effect } from '../src/reactivity/effect'
import {isProxy, isReactive, isReadOnly, reactive, readOnly, shallowReadOnly} from '../src/reactivity/reactive'

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
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}] as {[key: string]: any}, someKey: {b: 6} } 
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
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}] as {[key: string]: any}, someKey: {b: 6} } 
    const proxyObj = readOnly(obj)

    expect(isReadOnly(proxyObj)).toBe(true)
    expect(isReadOnly(proxyObj.skill)).toBe(true)
    expect(isReadOnly(proxyObj.someKey)).toBe(true)
    expect(isReadOnly(proxyObj.skill[1])).toBe(true)
  })

  test('reactive子对象依赖', () => {
    const obj = { age: 1, skill: ["sing", {piano: 'level5'}] as {[key: string]: any}, someKey: {b: 6} } 
    const proxyObj = reactive(obj)

    expect(isReactive(proxyObj)).toBe(true)
    expect(isReactive(proxyObj.skill)).toBe(true)
    expect(isReactive(proxyObj.someKey)).toBe(true)
    expect(isReactive(proxyObj.skill[1])).toBe(true)

    const log = jest.fn(() => {
      console.log(proxyObj.skill)
    })

    effect(log)

    expect(log).toBeCalledTimes(1)
    
    proxyObj.skill = [1]
    
    expect(log).toBeCalledTimes(2)


  })

  test('shallow->readonly', () => {
    const obj = { a: 1, foo: { b: 2 } }
    const proxyObj = shallowReadOnly(obj)

    expect(isReadOnly(proxyObj)).toBe(true)
    expect(isReadOnly(proxyObj.foo)).toBe(false)
  })


  test('isProxy', () => {
    const obj = { a: 1, foo: { b: 2 } }
    const shallowRead = shallowReadOnly(obj)
    const readOnlyObj = readOnly(obj)
    const reactiveObj = reactive(obj)

    expect(shallowRead).not.toBe(readOnlyObj);
    expect(readOnlyObj).not.toBe(reactiveObj);

    expect(isProxy(shallowRead)).toBe(true)
    expect(isProxy(shallowRead.foo)).toBe(false)

    expect(isProxy(readOnlyObj)).toBe(true)
    expect(isProxy(readOnlyObj.foo)).toBe(true)

    expect(isProxy(reactiveObj)).toBe(true)
    expect(isProxy(reactiveObj.foo)).toBe(true)


  })

  test('in 关键字依赖收集', () => {
    const user = reactive({ age: 10 })

    const inFunc = jest.fn(() => {
      if ('age' in user)
      console.log(`age is tracked`)
    })

    expect(inFunc).toBeCalledTimes(0)
    effect(inFunc)
    expect(inFunc).toBeCalledTimes(1)
    user.age = 20
    expect(inFunc).toBeCalledTimes(2)

  })

  test('for in 语句依赖收集', () => {
    const user = reactive({ age: 10 })

    const inFunc = jest.fn(() => {
      for (let key in user)
      console.log(`age is tracked`)
    })

    expect(inFunc).toBeCalledTimes(0)
    effect(inFunc)
    expect(inFunc).toBeCalledTimes(1)
    // @ts-ignore
    user.name = 20
    expect(inFunc).toBeCalledTimes(2)

  })

  test('for in 语句依赖收集-改变值不会重新触发', () => {
    const user = reactive({ age: 10 })

    const inFunc = jest.fn(() => {
      for (let key in user)
      console.log(`age is tracked`)
    })

    expect(inFunc).toBeCalledTimes(0)
    effect(inFunc)
    expect(inFunc).toBeCalledTimes(1)
    user.age = 20
    expect(inFunc).toBeCalledTimes(1)

  })


  test('delete 关键字依赖触发', () => {
    const user = reactive<{age?: number}>({ age: 10 })

    const inFunc = jest.fn(() => {
      for (let key in user)
      console.log(`age is tracked`)
    })

    expect(inFunc).toBeCalledTimes(0)
    effect(inFunc)
    expect(inFunc).toBeCalledTimes(1)
    delete user.age
    expect(inFunc).toBeCalledTimes(2)

  })

})