import { Obj } from "../../../types/base";

export function transform(root: any, options: Obj) {

  // 1. 深度遍历chileren
  // 2. 找到节点进行修改
  
  const context = createTransformContext(root, options)

  transformChildren(root, context)

  return root
}

function transformChildren(root: any, context: Obj) {
  
  const nodeTransforms = context.nodeTransforms || []
  
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(root)
  }
  
  traverseChildren(root, context);

}



function traverseChildren(root: any, context: any) {
  const children = root.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      transformChildren(node, context);
    }
  }
}

function createTransformContext(root: any, options: Obj) {
  return {
    root: root,
    nodeTransforms: options.nodeTransforms || []
  }
}

