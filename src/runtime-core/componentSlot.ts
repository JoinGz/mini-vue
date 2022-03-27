import { instance, Obj } from "../../types/base";
import { ShapeFlags } from "../shared/shapeFlags";
import { renderSlot } from "./helps/renderSolt";

export function initSlots(instance: instance, children: any) {

  /**
   * 为什么需要转换
   * children 里面的值为
   * {header: {type: 'p' ...}}
   * 在 mountElement 因为其值不是array
   * 所以执行 el.innerText 就会页面变成 [object]
   */

  if (instance.vnode.shapeFlag! & ShapeFlags.SLOT_CHILDREN) {

    const $slot:Obj = {}
  
    normalizeObjectSolt(children, $slot)
  
    instance.$slot = $slot
  }


}

function normalizeObjectSolt(children: Obj, slot: Obj) {
  for (const key in children) {
    const slotType = children[key]
    // 作用域插槽，传入值后返回 vode[]
    slot[key] = (...arg: any[]) => {
      const value = slotType(...arg)
      return normalizeSoltValue(value)
    }
  }
}

function normalizeSoltValue(value: any) {
  return Array.isArray(value) ? value : [value]
}