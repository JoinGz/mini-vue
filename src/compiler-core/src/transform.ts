import { Obj } from "../../../types/base";
import { NodeTypes } from "./nodeTypes";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimehelpers";

export function transform(root: any, options: Obj = {}) {

  // 1. 深度遍历chileren
  // 2. 找到节点进行修改
  
  const context = createTransformContext(root, options)

  transformChildren(root, context)

  createRootCodegen(root)

  root.helps = [...context.helps.keys()]

  return root
}

function transformChildren(root: any, context: Obj) {
  
  const nodeTransforms = context.nodeTransforms || []
  
  const exitFn = []

  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    const fn = transform(root, context)
    if (fn) {
      exitFn.push(fn)
    }
  }
  
  traverseChildren(root, context);

  // for (let i = exitFn.length - 1; i >= 0 ; i--) {
  //   exitFn[i]();
  // }

  let i = exitFn.length
  while (i--) {
    exitFn[i]();
  }
}



function traverseChildren(root: any, context: any) {
  const children = root.children;


  switch (root.type) {
    case NodeTypes.INTERPOLATION:
        traverseExpression(root, context)
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
        traverseElement(children, context);
    default:
      break;
  }

}

function traverseElement(children: any, context: any) {
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    transformChildren(node, context);
  }
}

function createTransformContext(root: any, options: Obj) {
  const context =  {
    root: root,
    nodeTransforms: options.nodeTransforms || [],
    helps: new Map(),
    addHelp(key: string) {
      context.helps.set(key, 1)
    }
  }
  return context
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

function traverseExpression(root: any, context: any) {
  context.addHelp(TO_DISPLAY_STRING)
}

