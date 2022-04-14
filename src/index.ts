export * from "./runtime-dom/index";

import * as runtimeDom from "./runtime-dom/index";


import { baseCompile } from './compiler-core/src/compiler'

import { createCompiler } from './runtime-core/index'


function createBaseCompile(template: string){
  const { code } = baseCompile(template)

  const render = new Function('Vue', code)(runtimeDom)

  return render
  
}

createCompiler(createBaseCompile)
