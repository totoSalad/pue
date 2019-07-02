import parse, {DOMElement} from "../parser";

describe("text", () => {
  test("parse 内容", () => {
    const template =
    "<div>" +
      '<loading m-if="loading">loading</loading>' +
      '<p class="el_input">输入的内容是：{{inputText}}</p>' +
    "</div>"
    const vdom = parse(template)
    expect(((vdom as DOMElement).children[0]as DOMElement).attrsMap).toEqual({"m-if": "loading"})
    expect(((vdom as DOMElement).children[1]as DOMElement).attrs).toEqual([{name: "class", value: "\"el_input\""}])
  });
  test("for", () => {
    const template =
    "<div m-for=\"item in items\">" +
      "<p>输入的内容是：{{item}}</p>" +
    "</div>"
    const vdom = parse(template)
    expect((vdom as DOMElement).for).toEqual("items")
    expect((vdom as DOMElement).alias).toEqual("item")
  });
});
