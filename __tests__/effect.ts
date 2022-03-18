import { reactive } from '../src/reactive'
import { effect, stop } from '../src/effect'

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

  it('scheduler', () => {
    // 1. effect 第二个参数接受为一个对象，其中key为scheduler的值是一个函数
    // 2. 当effect里面的依赖收集时，收集的不在为effect的第一个函数，而是 scheduler函数
    // 3. 执行effect返回的runner时，还是执行的effect的第一个函数

    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })

    const obj = reactive({ age: 1 })
    let num
    const runner = effect(
      () => {
        num = obj.age + 1
      },
      {
        scheduler,
      }
    )

    // scheduler 不会一开始就运行
    expect(scheduler).not.toHaveBeenCalled()

    // 执行过 effect 的第一个入参方法
    expect(num).toBe(2)

    obj.age++

    expect(scheduler).toHaveBeenCalledTimes(1)

    // 当有 scheduler 时, 依赖收集的为 scheduler， 而非 effect 的第一个入参方法
    expect(num).toBe(2)

    run()

    // 执行runner时，执行的为effect的第一个入参方法
    expect(num).toBe(3)
  })

  it('effect-stop', () => {
    let num
    const obj = reactive({ age: 1 })
    const runner = effect(() => {
      num = obj.age
    })
    obj.age = 2
    expect(num).toBe(2)

    stop(runner)

    obj.age = 3

    expect(num).toBe(2)

    runner()

    expect(num).toBe(3)
  })
  
  it.skip('effect-stop-支持响应式版', () => {
    // 目前暂未支持
    let num
    const obj = reactive({ age: 1 })

    const runner = effect(() => {
      num = obj.age +1
    })

    expect(num).toBe(2)

    stop(runner)

    obj.age++

    expect(num).toBe(2)

    runner()

    expect(num).toBe(3)
  })

  it('effect-onStop', () => {

    let num; 

    const onStop = jest.fn()

    const obj = reactive({ age: 1 })
    
    const runner = effect(() => {
      num = obj.age + 1
    }, {
      onStop
    })

    stop(runner)

    expect(onStop).toBeCalledTimes(1)

    
  })


})
