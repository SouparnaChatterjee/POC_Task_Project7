# Yosys Browser POC

> Run real hardware synthesis directly in your browser
> No servers, no installs — just Verilog → Circuit

---

## What this is

This started as a small experiment to see if something like Yosys could run fully in the browser without any backend.

It runs **Yosys (a real Verilog synthesis tool)** using WebAssembly and turns the result into an interactive circuit you can play with.
The idea is pretty simple: write some Verilog, hit synthesize, and see the circuit immediately.

---

## What you get
<img width="1918" height="1032" alt="image" src="https://github.com/user-attachments/assets/ea41d467-f8a6-446f-912b-3e66906721c3" />

* Real synthesis (actual Yosys, not a custom parser)
* JSON netlist output
* Interactive circuit view
* Basic simulation (toggle inputs, see outputs change)
* Runs completely on the client (no server calls)

---

## Demo

> Edit Verilog → Synthesize → interact with the circuit

---

## How it works (high-level)

```
Verilog
  ↓
Yosys (WASM in a worker)
  ↓
JSON netlist
  ↓
yosys2digitaljs
  ↓
DigitalJS
  ↓
Interactive circuit
```

---

## Architecture

```
Browser

├── Main thread
│   ├── Editor
│   ├── Controls
│   └── Canvas (DigitalJS)
│
├── Web Worker
│   ├── Yosys WASM (~8MB)
│   └── runYosys()
│
└── Render layer
    ├── yosys2digitaljs
    └── DigitalJS
```

---

## Inside the pipeline

### 1. Synthesis

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
```

---

### 2. Output decoding

```js
const raw = result['output.json'];
const json = JSON.parse(new TextDecoder().decode(raw));
```

---

### 3. Netlist → Circuit

| Yosys Cell | Maps to     |
| ---------- | ----------- |
| `$and`     | AND gate    |
| `$or`      | OR gate     |
| `$mux`     | Multiplexer |
| `$dff`     | Flip-flop   |

Each element becomes a small component with its own state, connections, and update logic.

---

### 4. Simulation model

```
Input change
   ↓
Propagate to connected gates
   ↓
Recompute outputs
   ↓
Forward propagation
   ↓
Stable state
```

---

## Tech stack

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

├── index.html
├── worker.js
├── bundle.js
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

### 3. Build

```bash
npx webpack
```

### 4. Run

```bash
npx serve .
```

---

## Note

Don’t open with `file://` — WebAssembly and Web Workers need HTTP.

---

## Tested circuits

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

* First load takes ~10–30s (WASM download, then cached)
* Larger circuits can be slow
* Requires a modern browser
* No persistence yet

---

## Browser support

| Browser | Status |
| ------- | ------ |
| Chrome  | Yes    |
| Edge    | Yes    |
| Firefox | Yes    |
| Safari  | Yes    |
| IE      | No     |

---

## Why this project matters

It shows that tools like Yosys can run directly in the browser and still be useful.
You can go from code to a working circuit instantly without setting anything up.

---

## License

MIT

---

## Credits

* Yosys
* YoWASP
* DigitalJS
* yosys2digitaljs

---

*Built as a small proof-of-concept for client-side Verilog synthesis.*
