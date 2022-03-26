import { instance } from '../../types/base'
import { camelize, toHandlerKey } from '../shared/utils'

export function emit(instance: instance, handlerName: string, ...arg: any[]) {
  const { props } = instance

  
  handlerName = toHandlerKey(camelize(handlerName))
  
  const handler = props![handlerName]
  
  handler && handler(...arg)
  
}

