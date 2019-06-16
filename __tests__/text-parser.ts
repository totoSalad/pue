import parseText from "../parser/text-parser";

describe("text", () => {
  test("内容在中间", () => {
    const text = parseText("{{price}} 元/ {{time}}")
    expect(text).toBe("this._s(this.props.data.price)+\" 元/ \"+this._s(this.props.data.time)")
  });

  test("前后均有值", () => {
    const text = parseText("牛奶价格:{{price}} 元/ {{time}} 月")
    expect(text).toBe("\"牛奶价格:\"+this._s(this.props.data.price)+\" 元/ \"+this._s(this.props.data.time)+\" 月\"")
  });
});
