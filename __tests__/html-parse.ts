import htmlParser from "../parser/html-parser";

describe("parse", () => {
  test("comment", () => {
    const commentCallBack = jest.fn((text) => text);
    htmlParser.parse("<!-- ahahah -->", {
      comment: commentCallBack,
    });
    expect(commentCallBack).toBeCalledWith(" ahahah ");
  });
});
