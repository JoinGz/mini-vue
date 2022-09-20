import { reactive } from "../src/reactivity/reactive"
import { watch } from "../src/reactivity/watch"


describe('watch', () => {
  test('watch happyPath', () => {
    const user = reactive({ age: 18 })
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user, userChangeFn)

    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.age++

    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })

  test('watch 循环依赖', async () => {
    const loopUser: any = { age: 18 }
    loopUser.other = loopUser
    const user = reactive(loopUser)
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user, userChangeFn)

    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.age++

    await Promise.resolve() // vue3里回调是queueJob异步里

    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })

  test('watch 循环依赖,收集后', async () => {
    const loopUser: any = { age: 18 }
    const user = reactive(loopUser)
    user.other = user
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user, userChangeFn)

    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.age++

    await Promise.resolve() // vue3里回调是queueJob异步里

    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })

  test('watch 监听循环依赖', async () => {
    const loopUser: any = { age: 18 }
    const user = reactive(loopUser)
    user.other = user
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user.other, userChangeFn)

    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.other.age++

    await Promise.resolve() // vue3里回调是queueJob异步里

    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })

  test('watch 立即执行', async () => {
    const aUser: any = { age: 18 }
    const user = reactive(aUser)
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user, userChangeFn, {immediate: true})

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(userChangeFn).toHaveBeenCalledTimes(1)

    user.age++

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(userChangeFn).toHaveBeenCalledTimes(2)
  })

  test('watch getter函数', async () => {
    const aUser: any = { age: 18 }
    const user = reactive(aUser)
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(()=>user.age, userChangeFn)

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.age++

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })

  test('watch 新值与旧值', async () => {
    const aUser: any = { age: 18 }
    const user = reactive(aUser)
    let oldV, newV;
    const userChangeFn = jest.fn((oldValue, newValue) => {
      oldV = oldValue
      newV = newValue
      console.log(`user changed`)
    })

    watch(()=>user.age, userChangeFn)

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(oldV).toBe(undefined)
    expect(newV).toBe(undefined)

    user.age++

    await Promise.resolve() // vue3里回调是queueJob异步里
    expect(oldV).toBe(18)
    expect(newV).toBe(19)
  })

  test('watch 竞态', (done) => {
    const aUser: any = { age: 18 }
    const user = reactive(aUser)
    let newV: any,
      time = 1
    const userChangeFn = (oldValue: any, newValue: any, onInvalidate: any) => {
      console.log('enter user change - ' + newValue)
      let isInvalid: boolean
      onInvalidate(() => (isInvalid = true))
      setTimeout(
        () => {
          if (!isInvalid) {
            newV = newValue
          }
          console.log(`newV-change - ` + newValue)
        },
        time % 2 == 1 ? 300 : 100
      )
      time++
    }

    watch(() => user.age, userChangeFn)

    user.age = 19 // spend 300ms
    user.age = 20 // spend 100ms

    setTimeout(() => {
      expect(newV).toBe(20)
      done()
    }, 1000)
  })
})