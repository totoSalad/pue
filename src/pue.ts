import parse, { Element } from "../parser";
import patchInit from "./patch";
import watchData from "./watch"

interface PueOption {
  el: string
  template: string
  data: {[key: string]: any}
  mounted: () => void
}

export default function Pue(options: PueOption) {
  this.init(options);
}

watchData(Pue);
patchInit(Pue);

Pue.prototype.init = function(options: PueOption) {
  const {el, template, data, mounted} = options
  this.el = el
  this.data = data

  // 解析 template
  const templateTree = parse(template)
  // 构建 render 函数
  this.compiler = new Function("return " + this.getRenderFunc(templateTree))

  // TODO: 执行 render 函数
  this.render()

  // mounted 函数
  mounted.call(this)

  this.defineReactive()
}

Pue.prototype.render = function() {
  // 获取 vdom
  // render vdom
  const newTree = this.compiler()
  const container = document.querySelector(this.el)
  const rootElement = (container && container.children[0]) || null;
  const oldTree = rootElement && recycleElement(rootElement);

  this.patch(container, rootElement, oldTree, newTree)

}

Pue.prototype.getRenderFunc = function(node: Element) {
  let tempStr = ""

  if (node.type === 1) {
    // 无子元素
    if (node.children.length === 0) {
      tempStr = `this._h('${node.tag}',${JSON.stringify(node.attrsMap)})`;
    } else {
      const children = node.children;
      const h_childs = []
      for (const child of children) {
        h_childs.push(this.getRenderFunc(child))
      }
      tempStr = `this._h('${node.tag}',${JSON.stringify(node.attrsMap)},[${h_childs.join(",")}])`
    }
  } else if (node.type === 2) {
    tempStr = node.expression ? node.expression : `'${node.text}'`
   }

  return tempStr
}

Pue.prototype._h = function(tag: string, attributes: Record<string, any>, children: Element[]) {
  const mDirect = /^m-/
  let isNeed = true
  const node = {
    nodeName: tag,
    attributes,
  }

  // 处理 m-x
  const mDirections: Record<string, any> = Object.keys(attributes).reduce((directions: Record<string, any>, key) => {
    if (key.match(mDirect)) {
      directions[key] = attributes[key]
    }
    return directions
  }, {})

  Object.keys(mDirections).forEach((key) => {
    if (key === "m-if") {
      const propValue = new Function(`return this.data.${mDirections[key]}`).call(this)
      isNeed = propValue
    } else if (key === "m-model") {
      const propValue = new Function(`return this.data.${mDirections[key]}`).call(this);
      node.value = propValue;
  }
  })
  // 处理 invisible
  if (!isNeed) { return undefined }

  // 处理 children
  if (children && children.length) {
    children = children.filter((child) => {
      return child !== undefined
    })
    node.children = children
  }

  return node
}

Pue.prototype._s = function(expression: string) {
  return expression
}

const recycleElement = (node: HTMLElement): DOMTree => {
  return {
    nodeName: node.nodeName.toLowerCase(),
    attributes: {},
    children: Array.prototype.map.call(node.childNodes, function(element: HTMLElement): any {
        return element.nodeType === 3 // Node.TEXT_NODE
            ? element.nodeValue
            : recycleElement(element)
    }),
  }
}
