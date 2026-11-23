import fs from "node:fs";
import vm from "node:vm";

const code = fs.readFileSync("docs/microsoft-store-languages-autotick.js", "utf8");
const makeBox = (label, checked = false) => ({
  type: "checkbox",
  id: "cb-" + label.replace(/\W/g, "-"),
  checked,
  title: label,
  getAttribute(n) { return n === "title" ? this.title : null; },
  closest() { return null; },
  click() { this.checked = !this.checked; },
});
const boxes = [
  makeBox("English", true),
  makeBox("English (United Kingdom)"),
  makeBox("Arabic (Egypt)"),
  makeBox("Chinese (Traditional) (Taiwan)"),
  makeBox("Norwegian (Nynorsk)"),
  makeBox("Valencian"),
];
const document = {
  querySelectorAll: () => boxes,
  querySelector: () => null,
  getElementById: () => null,
};
const context = { document, window: {}, console, CSS: { escape: (s) => s } };
vm.createContext(context);
vm.runInContext(code, context);
const api = context.window.__esuyoTick;
const preview = api.preview();
const ticked = api.tick();
const state = boxes.map((b) => `${b.title}=${b.checked}`);
const undone = api.untick();
console.log({ preview, ticked, undone, state });
