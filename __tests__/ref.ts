import { effect } from "../src/effect";
import { ref } from "../src/ref";

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
    
  })

  

})