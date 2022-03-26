import { instance, Obj } from "../../types/base";

export function initProps(instance: instance, rowProps: Obj = {}) {
  instance.props = rowProps
}