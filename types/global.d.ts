interface Vdom {
  nodeName: string,
  attributes: {[key: string]: string},
  children: (Vdom | string)[]
  value?: string
}


interface VDomAttribute {
  name: string,
  value: string
}
