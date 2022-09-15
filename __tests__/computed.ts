import { computed } from "../src/reactivity/computed"
import { effect } from "../src/reactivity/effect"
import { reactive } from "../src/reactivity/reactive"

describe('computed', () => {
  test('happy path', () => {
    const user = reactive({ age: 1 })
    
    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1)

  })

  test('computed->lazy', () => {
    const user = reactive({ age: 1 })
    
    const getter = jest.fn(() => {
      return user.age
      
    })

    const value = computed(getter)

    expect(getter).not.toHaveBeenCalled()

    // lazy
    expect(value.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)
    
    value.value // get
    expect(getter).toHaveBeenCalledTimes(1)
    
    // 依赖变更,不会重新执行getter但会更改内部的dirty
    user.age = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // 获取值时，触发更改
    expect(value.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
    
    // 再次获取，值没变不会重新生成
    value.value
    expect(getter).toHaveBeenCalledTimes(2)

  })


  test('嵌套的计算属性正常收集依赖', () => {
    
    const user = reactive({ age: 18 })
    const computedAge = computed(() => {
      return user.age + 1
    })
    
    const getComputedAgeFn = jest.fn(() => {
      console.log(`computedUser->change: ${computedAge.value}`)
    })

    expect(getComputedAgeFn).toBeCalledTimes(0)
    effect(getComputedAgeFn)
    expect(getComputedAgeFn).toBeCalledTimes(1)
    
    user.age++
    expect(getComputedAgeFn).toBeCalledTimes(2)



  })

})
