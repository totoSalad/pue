const patch = (Mue: {[key: string]: any}) => {
  
  // vdom 渲染成 real dom
  Mue.prototype.createElement = function (vdom: Vdom | string){
    const isTextNode = typeof vdom === "string" 
    // 创建元素
    if (isTextNode){
      return document.createTextNode(vdom as string)
    }

    let element = document.createElement((vdom as Vdom).nodeName)
    Object.keys((vdom as Vdom).attributes).map(key => {
      element.setAttribute(key, (vdom as Vdom).attributes[key])
    })
    if(element.children){
      for(let child of (vdom as Vdom).children){
        element.appendChild(this.createElement((child)))
      }
    }

    // 事件注册
    addEventListener(vdom as Vdom, element, this)
    return element
    
  }
}

const addEventListener = (vdom: Vdom, element: HTMLElement, mue: {[key: string]: any}) => {
  if(vdom.nodeName === 'input'){
    (element as HTMLInputElement).value = vdom.value || ''
    element.addEventListener('input', function (e) {
        let expression = vdom.attributes["m-model"];
        let val = e.target.value
        // 如何处理
        let str = `this.data.${expression}='${val}'`;
        (new Function(str)).call(mue)
    })
  }
}

export default patch
