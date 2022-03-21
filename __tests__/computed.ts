import { computed } from "../src/computed"
import { reactive } from "../src/reactive"

describe('computed', () => {
  test('happy path', () => {
    const user = reactive({ age: 1 })
    
    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1)

  })

  test.skip('computed->lazy', () => {
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
    
    // user.age = 2
    // expect(getter).toHaveBeenCalledTimes(2)







  })
})
