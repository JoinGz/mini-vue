import { vnode } from "../../../types/base";
import { anyFunction } from "../../reactivity/watch";


export const Teleport = {
  __isTeleport: true,
  process(
    vnode1: vnode,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: any,
    insertBeforeDom: HTMLElement | null,
    { patch, patchChildren, move }: {patch: anyFunction, patchChildren: anyFunction, move: anyFunction}
  ) {

    if (!vnode1) {
      // todo: select render传过来
      const container = document.querySelector(vnode2.props!.to);
      (vnode2.children! as vnode[]).forEach((v: vnode) => {
        patch(null, v, container, parentInstance, insertBeforeDom)
      });
    } else {
      const oldBox = document.querySelector(vnode1.props!.to);
      patchChildren(vnode1, vnode2, oldBox, parentInstance, insertBeforeDom)
      if (vnode1.props!.to !== vnode2.props!.to) {
        const newTarget = document.querySelector(vnode2.props!.to);
        (vnode2.children! as vnode[]).forEach((v: vnode) => {
          move(v, newTarget)
        });
      }
    }

  },
}
