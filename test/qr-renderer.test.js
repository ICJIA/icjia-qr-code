import { createQr, fileExtension, SIZE } from "../src/scripts/qr-renderer.js";

describe("qr-renderer", () => {
  describe("fileExtension", () => {
    it("maps UI 'jpg' to qr-code-styling 'jpeg'", () => {
      expect(fileExtension("jpg")).toBe("jpeg");
    });

    it("passes through png, webp, and svg", () => {
      expect(fileExtension("png")).toBe("png");
      expect(fileExtension("webp")).toBe("webp");
      expect(fileExtension("svg")).toBe("svg");
    });

    it("falls back to png for unknown formats", () => {
      expect(fileExtension("bmp")).toBe("png");
    });
  });

  describe("createQr", () => {
    it("uses a 320px canvas", () => {
      expect(SIZE).toBe(320);
    });

    it("returns an instance exposing the qr-code-styling API", async () => {
      const qr = await createQr({ data: "https://icjia.illinois.gov" });
      expect(typeof qr.append).toBe("function");
      expect(typeof qr.update).toBe("function");
      expect(typeof qr.getRawData).toBe("function");
    });
  });
});
