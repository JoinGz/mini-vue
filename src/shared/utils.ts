export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function hasChanged(value: any, newValue: any) {
  return !Object.is(value, newValue)
}

export function hasOwn(obj: object, key: string| number | symbol)  {
  return Object.prototype.hasOwnProperty.call(obj, key)
} 

export function toHandlerKey(fnName: string) {
  return fnName ? 'on' + capitalize(fnName) : "" 
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelize = (str: string) => {
  return str.replace(/-([\w])/g, (_: string, first: string) => {
    return first.toUpperCase()
  })
}

export const EMPTY_OBJ = {}