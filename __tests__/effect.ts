import {reactive} from '../src/reactive'
import {effect} from '../src/effect'

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
})
