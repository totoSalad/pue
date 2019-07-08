const watchData = (Pue) => {
  Pue.prototype.defineReactive = function() {
    const _pue = this

    const defineProperty = (obj: Record<string, any>, prop: string, val: any) => {
      // 继续遍历
      if (val && typeof val === "object") {
        Object.keys(val).forEach((valprop: string) => {
          defineProperty(val, valprop, val[valprop])
        })
      } else {
        Object.defineProperty(obj, prop, {
          get() {
            return val
          },
          set(newVal) {
            // 这句没有是不是 ok ??
            val = newVal
            _pue.reactiveCollection()
          },
        } )
      }
    }

    Object.keys(this.data).forEach((prop: string) => {
      defineProperty(this.data, prop, this.data[prop])
    })
  }
  Pue.prototype.reactiveCollection = function() {
    this.render()
  }
}

export default watchData
