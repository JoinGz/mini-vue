export function isObject(obj: {}) {
  return obj !== null && typeof obj === 'object'
}

export function hasChanged(value: any, newValue: any) {
  return !Object.is(value, newValue)
}