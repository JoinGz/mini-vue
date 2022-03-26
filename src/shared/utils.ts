export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function hasChanged(value: any, newValue: any) {
  return !Object.is(value, newValue)
}

export function hasOwn(obj: object, key: string| number | symbol)  {
  return Object.prototype.hasOwnProperty.call(obj, key)
} 