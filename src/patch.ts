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
const patch = (Mue: {[key: string]: any}) => {

  // vdom 渲染成 real dom
  Mue.prototype.createElement = function(vdom: Vdom | string) {
    const isTextNode = typeof vdom === "string";
    // 创建元素
    if (isTextNode) {
      return document.createTextNode(vdom as string);
    }

    const element = document.createElement((vdom as Vdom).nodeName);
    Object.keys((vdom as Vdom).attributes).map((key) => {
      element.setAttribute(key, (vdom as Vdom).attributes[key]);
    });
    if (element.children) {
      for (const child of (vdom as Vdom).children) {
        element.appendChild(this.createElement((child)));
      }
    }

    // 事件注册
    addEventListener(vdom as Vdom, element, this);
    return element;

  };
};

const addEventListener = (vdom: Vdom, element: HTMLElement, mue: {[key: string]: any}) => {
  if (vdom.nodeName === "input") {
    (element as HTMLInputElement).value = vdom.value || "";
    element.addEventListener("input", function(e) {
        const expression = vdom.attributes["m-model"];
        const val = e.target.value;
        // 如何处理
        const str = `this.data.${expression}='${val}'`;
        (new Function(str)).call(mue);
    });
  }
};

export default patch;
