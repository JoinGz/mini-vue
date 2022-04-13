import { NodeTypes } from "../nodeTypes";
import { CREATE_ELEMENT_VNODE } from "../runtimehelpers";


export function transformElement(ast: any, context: any) {


  return () => {
    if (ast.type === NodeTypes.ELEMENT) {
      context.addHelp(CREATE_ELEMENT_VNODE)
    }
    
  }


}


