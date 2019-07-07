
import { DOMTree } from "../src/patch";
import {diff} from "./diff"

const patchDom = (element: HTMLElement, oldTree: DOMTree, newTree: DOMTree) => {
  const patches = getDiffs(oldTree, newTree)
  applyPatch(element, patches)
}

const getDiffs = (oldTree: DOMTree, newTree: DOMTree) => {
  const index = 0 // 当前节点的标志
  const patches = {} // 用来记录每个节点差异的对象
  dfsWalkDiff(oldTree, newTree, index, patches)
  return patches
}
const dfsWalkDiff = (oldTree: DOMTree, newTree: DOMTree, index: number, patch: Record<string, any>) => {

}

export default patchDom
