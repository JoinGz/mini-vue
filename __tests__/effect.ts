import { reactive } from '../src/reactivity/reactive'
import { effect, stop } from '../src/reactivity/effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({ age: 10 })
    let userAge
    effect(() => {
      // userAge = user.age + 1
      userAge = user.age++ // Maximum call stack size exceeded
    })

    // get  -> 10
    // set  -> 11 -> 触发 get 收集的依赖
    // 

    expect(userAge).toBe(10)

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
  
  it('effect-stop-支持响应式版', () => {
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

  it('分支切换', () => {
    const data = { ok: true, text: 'hello world' }
    const obj = reactive(data)

    const effectFn = jest.fn(() => {
      // console.log(`触发了依赖`)
      result = obj.ok ? obj.text : 'not'
    })

    let result;

    effect(effectFn)

    expect(result).toBe('hello world')
    obj.ok = false // obj.ok为false时，obj.text之前收集到的依赖应该清除
    expect(effectFn).toBeCalledTimes(2)
    expect(result).toBe('not')


    obj.text = 'dont called effectFn';
    expect(effectFn).toBeCalledTimes(2) // obj.text无依赖

  })

  it.skip('嵌套的effect', () => {
    const people = reactive({ age: 20, name: 'test' })

    const nameFn = jest.fn(function nameFnJest() {
      const name = people.name + ' _name_ '
    })
    const ageFn = jest.fn(function ageFnJest() {
      const age = people.age + 1
      effect(nameFn)
    })

    effect(ageFn)
    expect(ageFn).toBeCalledTimes(1)
    expect(nameFn).toBeCalledTimes(1)
    
    people.age = 30
    expect(ageFn).toBeCalledTimes(2)
    expect(nameFn).toBeCalledTimes(2)
    
    people.name = 'new Name'
    expect(ageFn).toBeCalledTimes(2)
    expect(nameFn).toBeCalledTimes(3)


  })

  it.skip('嵌套effect', () => {
     // 原始数据
     const data = { foo: true, bar: true }
     // 代理对象
     const obj = reactive(data)
    
     // 全局变量
     let temp1, temp2
    
     // effectFn1 嵌套了 effectFn2
     effect(function effectFn1() {
       console.log('effectFn1 执行')
    
       effect(function effectFn2() {
         console.log('effectFn2 执行')
         // 在 effectFn2 中读取 obj.bar 属性
         temp2 = obj.bar
       })
       // 在 effectFn1 中读取 obj.foo 属性
       temp1 = obj.foo
     })
     obj.foo = false
  })

})
