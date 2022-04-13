import { Obj } from "../../../types/base";

export const TO_DISPLAY_STRING = Symbol("toDisplayString");
export const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");

export const helperMapName: Obj = {
  [TO_DISPLAY_STRING]: "toDisplayString",
  [CREATE_ELEMENT_VNODE]: "createElementVNode",
};
