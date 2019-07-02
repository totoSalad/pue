// 介绍这个之前，可以先用 simplehtmlparser.js 做例子

import parseHTML from "./html-parser";
import parseText from "./text-parser";

const dirRE = /^m-|^@|^:/
const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/

export interface DOMElement {
  type: 1
  tag: string
  // attrsList 数组形式
  attrsList: VDomAttribute[]
  // attrsMap 对象形式，如 {id: 'app', 'm-text': 'xxx'}
  attrsMap: Record<string, any>
  attrs: Record<string, any>
  parent: Element
  children: Element[]
  hasBindings?: boolean
}

export interface ForElement extends DOMElement {
  for: string
  alias: string
}

export interface TextElement {
  type: 2
  expression: string
  text: string
}
export interface CommentElement {
  type: 3
  text: string
  isComment: boolean
}

export type Element = DOMElement | TextElement | CommentElement

/**
 * Convert HTML string to AST.
 */
export default function parse(
    template: string,
) {
    // 节点栈
    const stack: Element[] = []
    // 根节点，最终改回返回
    let root: Element
    // 当前的父节点
    let currentParent: Element

    parseHTML.parse(template, {
        // node 的开始
        start(tag: string, attrs: VDomAttribute[], unary: boolean) {
            // unary 是否一元标签，如 <img/>

            const element: DOMElement = {
                type: 1,
                tag,
                // attrsList 数组形式
                attrsList: attrs,
                // attrsMap 对象形式，如 {id: 'app', 'm-text': 'xxx'}
                attrsMap: makeAttrsMap(attrs),
                parent: currentParent,
                children: [],
            }

            // 处理属性
            // 第一，处理指令：m-bind m-on 以及其他指令的处理
            // 第二，处理普通的 html 属性，如 style class 等
            processAttrs(element)

            // tree management
            if (!root) {
                // 确定根节点
                root = element
            }
            if (currentParent && currentParent.type === 1) {
                // 当前有根节点
                currentParent.children.push(element)
                element.parent = currentParent
            }
            if (!unary) {
                // 不是一元标签（<img/> 等）
                currentParent = element
                stack.push(element)
            }
        },
        // node 的结束
        end() {
            // pop stack
            stack.length -= 1
            currentParent = stack[stack.length - 1]
        },
        // 字符
        chars(text: string) {
            const children = (currentParent as DOMElement).children
            let expression
            // 处理字符
            expression = parseText(text)  // 如 '_s(price)+" 元"' ，_s 在 core/instance/render.js 中定义
            children.push({
                type: 2,
                expression,
                text,
            })
        },
        // 注释内容
        comment(text: string) {
          (currentParent as DOMElement).children.push({
                type: 3,
                text,
                isComment: true,
            })
        },
    })
    return root
}

function makeAttrsMap(attrs: VDomAttribute[]) {
    const map: Record<string, any> = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

function processAttrs(el: DOMElement) {
    // 获取属性列表
    const list = el.attrsList
    let i, l, name, rawName, value;
    for (i = 0, l = list.length; i < l; i++) {
        // 获取属性的 name 和 value
        name = rawName = list[i].name
        value = list[i].value

        if (dirRE.test(name)) {
          el.hasBindings = true
          // 暂不处理
        } else {  // 不是指令
            // 普通属性加入 el.attrs
            // el.attrs.push(name, value)
            addAttr(el, name, JSON.stringify(value))
        }
    }
}

function addAttr(el: DOMElement, name: string, value: any) {
  (el.attrs || (el.attrs = [])).push({ name, value })
}

function getAndRemoveAttr(el: DOMElement, name: string) {
  let val
  if ((val = el.attrsMap[name]) != null) {
      const list = el.attrsList
      for (let i = 0, l = list.length; i < l; i++) {
          if (list[i].name === name) {
              list.splice(i, 1)
              break
          }
      }
  }
  return val
}
