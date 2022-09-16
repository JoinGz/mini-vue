import { reactive } from "../src/reactivity/reactive"
import { watch } from "../src/reactivity/watch"


describe('watch', () => {
  test('watch obj', () => {
    const user = reactive({ age: 18 })
    const userChangeFn = jest.fn(() => {
      console.log(`user changed`)
    })

    watch(user, userChangeFn)

    expect(userChangeFn).toHaveBeenCalledTimes(0)

    user.age++

    expect(userChangeFn).toHaveBeenCalledTimes(1)
  })
})