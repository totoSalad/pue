// 输入为
// {
//   "nodeName": "div",
//   "attributes": {},
//   "children": [
//     {
//       "nodeName": "h2",
//       "attributes": {"m-if": "count"},
//       "children": [计算所得的 count 值]
//     },
//   ]
// }

export interface DOMTree {
  nodeName: string
  attributes: Record<string, any>
  children: DOMTree[] | any
}

const patch = (Pue: {[key: string]: any}) => {

  // vdom 渲染成 real dom
  Pue.prototype.createElement = function(vdom: Vdom | string) {
    const isTextNode = typeof vdom === "string" || typeof vdom === "number";

    // 创建元素
    if (isTextNode) {
      return document.createTextNode(vdom as string);
    }

    const element = document.createElement((vdom as Vdom).nodeName);
    Object.keys((vdom as Vdom).attributes).map((key) => {
      element.setAttribute(key, (vdom as Vdom).attributes[key]);
    });
    if (vdom.children) {
      for (const child of (vdom as Vdom).children) {
        element.appendChild(this.createElement((child)));
      }
    }

    // 事件注册
    addEventListener(vdom as Vdom, element, this);
    return element;

  };

  // render 和 patch dom
  // TODO: 按照 diff patchDom 的模式改造
  Pue.prototype.patch = function(parent, element, oldNode, node, isSvg) {

    // 同一个node树，什么也不处理
    if (node === oldNode) {
      return
    } else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
        const newElement = this.createElement(node, isSvg)
        parent.insertBefore(newElement, element)

        if (oldNode != null) {
            removeElement(parent, element, oldNode)
        }

        element = newElement
    } else if (oldNode.nodeName == null) {
        element.nodeValue = node
    } else {
        const oldKeyed: Record<string, any> = {}
        const newKeyed: Record<string, any> = {}
        const oldElements = []
        const oldChildren = oldNode.children
        const children = node.children

        for (let i = 0; i < oldChildren.length; i++) {
            oldElements[i] = element.childNodes[i]

            const oldKey = getKey(oldChildren[i])
            if (oldKey != null) {
                oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
            }
        }

        let i = 0
        let k = 0

        while (children && k < children.length) {
            const oldKey = getKey(oldChildren[i])
            const newKey = getKey(children[k])

            // 新node树中还存在的旧节点保留
            if (newKeyed[oldKey]) {
                i++
                continue
            }

            if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
                if (oldKey == null) {
                    removeElement(element, oldElements[i], oldChildren[i])
                }
                i++
                continue
            }

            if (newKey == null) {
                if (oldKey == null) {
                    this.patch(element, oldElements[i], oldChildren[i], children[k], isSvg)
                    k++
                }
                i++
            } else {
                const keyedNode = oldKeyed[newKey] || []

                if (oldKey === newKey) {
                    this.patch(element, keyedNode[0], keyedNode[1], children[k], isSvg)
                    i++
                } else if (keyedNode[0]) {
                    this.patch(
                        element,
                        element.insertBefore(keyedNode[0], oldElements[i]),
                        keyedNode[1],
                        children[k],
                        isSvg,
                    )
                } else {
                    this.patch(element, oldElements[i], null, children[k], isSvg)
                }

                newKeyed[newKey] = children[k]
                k++
            }
        }

        while (i < oldChildren.length) {
            if (getKey(oldChildren[i]) == null) {
                removeElement(element, oldElements[i], oldChildren[i])
            }
            i++
        }

        for (const i in oldKeyed) {
            if (!newKeyed[i]) {
                removeElement(element, oldKeyed[i][0], oldKeyed[i][1])
            }
        }
    }
    return element
}
}

const addEventListener = (vdom: Vdom, element: HTMLElement, Pue: {[key: string]: any}) => {
  if (vdom.nodeName === "input") {
    (element as HTMLInputElement).value = vdom.value || "";
    element.addEventListener("input", function(e) {
        const expression = vdom.attributes["m-model"];
        const val = e.target.value;
        // 如何处理
        const str = `this.data.${expression}='${val}'`;
        (new Function(str)).call(Pue);
    });
  }
};

function getKey(node) {
  return node ? node.key : null
}

function removeChildren(element, node) {
  const attributes = node.attributes
  if (attributes) {
      for (let i = 0; i < node.children.length; i++) {
          removeChildren(element.childNodes[i], node.children[i])
      }

      if (attributes.ondestroy) {
          attributes.ondestroy(element)
      }
  }
  return element
}

function removeElement(parent, element, node) {
  function done() {
      parent.removeChild(removeChildren(element, node))
  }

  const cb = node.attributes && node.attributes.onremove
  if (cb) {
      cb(element, done)
  } else {
      done()
  }
}

export default patch;
