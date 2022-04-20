import { Fragment } from "../createVnode";
import { h } from "../h";

export function renderSlot(slots: any, slotName: string, ...arg: any[]) {
  const slot = slots[slotName]
  if (slot) {
    if (typeof slot === 'function') {
      // 在slot调用后得到 vnode
      return h(Fragment, null!, slot(...arg))
    }
  }
}