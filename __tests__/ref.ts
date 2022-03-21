import { effect } from "../src/effect";
import { ref } from "../src/ref";

describe('ref', () => {

  test('happ path', () => {
    const refObj = ref(1)
  
    expect(refObj.value).toBe(1)
  
    let num;
  
    effect(() => {
      const v = refObj.value
      num = <number>v + 1
    })
  
    expect(refObj.value).toBe(1)
    
    refObj.value = 2
    
    expect(num).toBe(3)

    refObj.value = 2

    // 相同的值不会出发依赖
    expect(num).toBe(3)
    
  })

  

})