import { reactive } from '../src/reactive'
import { effect } from '../src/effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({ age: 10 })
    let userAge
    effect(() => {
      userAge = user.age + 1
      // user.age++ // Maximum call stack size exceeded
    })

    expect(userAge).toBe(11)

    user.age++

    expect(userAge).toBe(12)
  })

  it('effect-runner', () => {
    // 实现effect返回一个函数（runner），且执行这个函数，相当于执行了传入effect时的函数，runner的返回值为传入effect函数的返回值

    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)

    const runnerResult = runner()

    expect(foo).toBe(12)
    expect(runnerResult).toBe('foo')
  })
})
