#  Yosys Browser POC

> Run real hardware synthesis directly in your browser.  
> No servers. No installs. Just Verilog → Circuit.

![Status](https://img.shields.io/badge/status-working-brightgreen)
![Platform](https://img.shields.io/badge/platform-browser-blue)
![Server](https://img.shields.io/badge/server%20calls-zero-4ecca3)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## What this is

This project proves something simple but powerful:

**You don’t need a backend to do serious EDA work.** It runs **Yosys (a full Verilog synthesis engine)** inside the browser using WebAssembly — and turns your code into an **interactive, simulated circuit** in real time.
Write Verilog → click a button → Circuit generated.

---

## What you get

-  **Real synthesis** (not a mock parser)
- **JSON netlist output** (fully inspectable)
-  **Interactive circuit diagram**
-  **Live simulation** (toggle inputs, watch propagation)
-  **100% client-side** — zero server calls

---

## Demo



> Edit Verilog → Synthesize → Interact with the circuit instantly.

---

##  How it works (high-level)

```

Verilog
│
▼
Yosys (WASM in Web Worker)
│
▼
JSON Netlist
│
▼
yosys2digitaljs
│
▼
DigitalJS Renderer
│
▼
Interactive Circuit

```

---

## Architecture

```

BROWSER
│
├── Main Thread (UI)
│     ├── Editor (Verilog input)
│     ├── Controls (Synthesize button)
│     └── Canvas (DigitalJS)
│
├── Web Worker
│     ├── Yosys WASM (~8MB)
│     └── runYosys()
│
└── Render Bundle
├── yosys2digitaljs
└── DigitalJS

````

---

## Inside the pipeline

### 1. Synthesis (real Yosys)

```js
const script = `
  read_verilog input.v;
  proc;
  opt;
  write_json output.json;
`;

const result = await runYosys(['-p', script], {
  'input.v': verilogCode
});
````

---

### 2. Output decoding

```js
const raw = result['output.json'];
const json = JSON.parse(new TextDecoder().decode(raw));
```

---

### 3. Netlist → Circuit

| Yosys Cell | Becomes     |
| ---------- | ----------- |
| `$and`     | AND gate    |
| `$or`      | OR gate     |
| `$mux`     | Multiplexer |
| `$dff`     | Flip-flop   |

Each becomes a live object with:

* state (`0 / 1`)
* connections
* update logic

---

### 4. Simulation model

```
Input change
   ↓
Trigger connected gates
   ↓
Recompute outputs
   ↓
Propagate forward
   ↓
Stable state reached 
```

---

## 🛠️ Tech stack

| Layer        | Tool            |
| ------------ | --------------- |
| Synthesis    | Yosys           |
| WASM         | Emscripten      |
| Distribution | @yowasp/yosys   |
| Threading    | Web Workers     |
| Translation  | yosys2digitaljs |
| Rendering    | DigitalJS       |
| Bundling     | Webpack         |

---

## Project structure

```
yosys-poc/
│
├── index.html        # UI + canvas
├── worker.js         # Yosys runner (WASM)
├── bundle.js         # render entry
├── webpack.config.js
│
├── dist/
│   └── render-bundle.js
│
└── package.json
```

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/yosys-poc.git
cd yosys-poc
```

### 2. Install

```bash
npm install
```

### 3. Build renderer

```bash
npx webpack
```

### 4. Run server

```bash
npx serve .
```

---

### Important

Do **NOT** open with `file://`

WebAssembly + Workers require HTTP.

---

## 🧪 Try these circuits

| Example       | Concept       |
| ------------- | ------------- |
| AND Gate      | Basic logic   |
| Full Adder    | Combinational |
| 4-bit Counter | Sequential    |
| 4:1 Mux       | Control logic |
| POC Mux       | Minimal demo  |

---

### Example: 2:1 Mux

```verilog
module mux (
  input a, b, sel,
  output y
);
  assign y = sel ? b : a;
endmodule
```

---

## Limitations

* First load takes approx. 10–30s (WASM download, cached after)
* Large designs can be slow
* Requires modern browser
* No persistence (yet)

---

## Browser support

| Browser | Status |
| ------- | ------ |
| Chrome  | Yes      |
| Edge    | Yes      |
| Firefox | Yes     |
| Safari  | Yes     |
| IE      | No     |

---

## Why this project matters

It shows that:

* Heavy compute tools **can run fully client-side**
* EDA workflows can be **instant and interactive**
* Browsers are capable of **real engineering workloads**

---

##  License

MIT

---

## Credits

* Yosys
* YoWASP
* DigitalJS
* yosys2digitaljs

---

*Built as a proof-of-concept for project 7- client side verilog synthesis.*

```
```

