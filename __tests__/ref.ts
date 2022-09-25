import { effect } from "../src/reactivity/effect";
import { reactive } from "../src/reactivity/reactive";
import { isRef, proxyRef, proxyRef_my, ref, toRef, toRefs, unRef } from "../src/reactivity/ref";

describe('ref', () => {

  test('happ path', () => {
    const refObj = ref<number>(1)
  
    expect(refObj.value).toBe(1)
  
    let num;
  
    effect(() => {
      const v = refObj.value
      num = v + 1
    })
  
    expect(refObj.value).toBe(1)
    
    refObj.value = 2
    
    expect(num).toBe(3)

    refObj.value = 2

    // 相同的值不会出发依赖
    expect(num).toBe(3)
    
  })



  test('ref->object', () => {
    const refObj = ref<{age: number}>({age: 10})
  
    expect(refObj.value.age).toBe(10)
  
    let num;
  
    effect(() => {
      num = refObj.value.age + 1
    })
  
    expect(num).toBe(11)
    
    refObj.value.age = 2
    
    expect(num).toBe(3)

    refObj.value.age = 2

    // 相同的值不会出发依赖
    expect(num).toBe(3)
    
    refObj.value = {age: 100}
    expect(num).toBe(101)

    refObj.value.age += 1
    expect(num).toBe(102)
  })


  test('isRef', () => {
    
    const refNumber = ref(1)
    const reactiveA = reactive({ a: 1 })

    expect(isRef(refNumber)).toBe(true)
    expect(isRef(reactiveA)).toBe(false)
    expect(isRef(1)).toBe(false)

  })

  test('unRef', () => {
    
    const refNumber = ref(1)
    
    expect(unRef(refNumber)).toBe(1)
    expect(unRef(1)).toBe(1)

  })

  test('proxyRef_my', () => {
    
    const refObj = ref({name: 'gz', skill: ['vue']})
    const proxtRefObj = proxyRef_my(refObj)
    expect(refObj.value.name).toBe('gz')

    expect(proxtRefObj.name).toBe('gz')

  })


  test('proxyRef', () => {
    const obj = {
      name: 'gz',
      skill: ref(['vue'])
    }
    const proxtRefObj = proxyRef(obj)
    expect(obj.skill.value[0]).toBe('vue')
    expect(proxtRefObj.skill[0]).toBe('vue')
    
    obj.skill.value = ['react']
    expect(proxtRefObj.skill[0]).toBe('react')
    
    proxtRefObj.skill = ['css']
    expect(obj.skill.value[0]).toBe('css')
    
    proxtRefObj.skill = ref(['js']) as unknown as string[]
    expect(obj.skill.value[0]).toBe('js')
    expect(proxtRefObj.skill[0]).toBe('js')

  })

  test('toRef', () => {
    const user = reactive({ age: 18 })
    const userRef = toRef(user, "age")

    const changeFn = jest.fn(() => userRef.value++)

    effect(changeFn)
    expect(changeFn).toHaveBeenCalledTimes(1)
    userRef.value++
    expect(changeFn).toHaveBeenCalledTimes(2)
    
  })
  test('toRefs', () => {
    const user = reactive({ age: 18 })
    const userRef = toRefs(user)

    const changeFn = jest.fn(() => userRef.age.value++)

    effect(changeFn)
    expect(changeFn).toHaveBeenCalledTimes(1)
    userRef.age.value++
    expect(changeFn).toHaveBeenCalledTimes(2)
    
  })

  test('toRefs', () => {
    const user = reactive({ age: 18, skill: [1,2] })
    const userRef = toRefs(user)

    const changeFn = jest.fn(() => userRef.skill.value[1])

    effect(changeFn)
    expect(changeFn).toHaveBeenCalledTimes(1)
    userRef.skill.value[1] = 1
    expect(changeFn).toHaveBeenCalledTimes(2)
    
  })

})