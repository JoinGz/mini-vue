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
})