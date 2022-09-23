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

  test('for in 、in、 reactive依赖', () => {
    const user = reactive({ age: 10,name: 'test' })

    const inFunc = jest.fn(() => {
      for (let key in user)
        console.log(`age is tracked`)
      if ('age' in user) {
        console.log(`age is user`)
      }
      console.log(user.name)
    })

    expect(inFunc).toBeCalledTimes(0)
    effect(inFunc)
    expect(inFunc).toBeCalledTimes(1)
    user.name = 'for'
    expect(inFunc).toBeCalledTimes(2)
    // @ts-ignore
    user.skill = 'vue'
    expect(inFunc).toBeCalledTimes(3)
    user.age++
    expect(inFunc).toBeCalledTimes(4)
    // @ts-ignore
    delete user.age
    expect(inFunc).toBeCalledTimes(5)

  })


  describe('数组的响应式', () => {
    test('happy path', () => {
      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        console.log(arr[1])
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
      arr[1] = 4

      expect(arrChangedCb).toHaveBeenCalledTimes(2)
    })

    test('length改变-触发length的依赖', () => {
      /**
       * 当设置值时。设置的值大于数组长度时，会触发length操作
       */
      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        console.log(arr.length)
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
      arr[3] = 4

      expect(arrChangedCb).toHaveBeenCalledTimes(2)
    })

    test('length改变-数组清空', () => {
      /**
       * 当设置值是length时；触发依赖时判断：所有大于新设置length值的依赖重新执行
       */
      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        console.log(arr[1])
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
      arr.length = 0

      expect(arrChangedCb).toHaveBeenCalledTimes(2)
    })

    test('length改变-数组清空-没依赖的不执行', () => {

      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        console.log(arr[0])
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
      arr.length = 2

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
    })

    test('数组的响应式-for in', () => {
      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        for (let i in arr) {
          console.log(`for in`)
        }
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)

      arr.length = 6

      expect(arrChangedCb).toHaveBeenCalledTimes(2)
    })

    test('数组的响应式-for of', () => {
      /**
       * for of里执行了array[index],同时触发了一些原生方法，所以剔除了symbol
       */
      const arr = reactive([1, 2, 3])

      const arrChangedCb = jest.fn(() => {
        for (let v of arr) {
          console.log(`for in`)
        }
      })

      effect(arrChangedCb)

      expect(arrChangedCb).toHaveBeenCalledTimes(1)
      
      arr[1] = 5
      expect(arrChangedCb).toHaveBeenCalledTimes(2)
      

      arr.length = 6
      expect(arrChangedCb).toHaveBeenCalledTimes(3)

    })
  })

  test('值改变才触发响应', () => {
    const user = reactive({ age: 18 })
    
    const changeFn = jest.fn(() => {
      console.log(user.age)
    })
    
    effect(changeFn)
    
    expect(changeFn).toHaveBeenCalledTimes(1)
    user.age = 18
    
    expect(changeFn).toHaveBeenCalledTimes(1)

  })

  test('值改变才触发响应-NaN', () => {
    const user = reactive({ age: NaN })
    
    const changeFn = jest.fn(() => {
      console.log(user.age)
    })
    
    effect(changeFn)
    
    expect(changeFn).toHaveBeenCalledTimes(1)
    user.age = NaN
    
    expect(changeFn).toHaveBeenCalledTimes(1)

  })

})