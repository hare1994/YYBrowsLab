// Runs the brow segmentation model (EasyPortrait SegFormer-B0) in a background thread, so the page and its
// loading animation stay smooth while the model works. Messages:
//   {type: "init", model}             -> {type: "ready"}            loads onnxruntime-web and the model
//   {type: "run", id, model, n, x}    -> {type: "result", id, lab}  x: Float32Array 3*n*n (RGB 0..255, planar);
//                                                                   lab: Uint8Array n*n class per pixel
//   any failure                       -> {type: "error", id, message}
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
let ort = null, sessP = null;

function session(model) {
  if (!sessP) sessP = (async () => {
    ort = await import(ORT + "ort.wasm.min.mjs");
    ort.env.wasm.numThreads = 1; ort.env.wasm.wasmPaths = ORT;
    return ort.InferenceSession.create(model, {executionProviders: ["wasm"]});
  })();
  return sessP;
}

self.onmessage = async e => {
  const m = e.data || {};
  try {
    if (m.type === "init") { await session(m.model); self.postMessage({type: "ready"}); return; }
    if (m.type === "run") {
      const sess = await session(m.model), n = m.n, N = n * n;
      const out = await sess.run({rgb: new ort.Tensor("float32", m.x, [1, 3, n, n])});
      const lg = out.logits.data, C = out.logits.dims[1], lab = new Uint8Array(N);
      for (let i = 0; i < N; i++) { let b = 0, bv = lg[i]; for (let k = 1; k < C; k++) { const v = lg[k * N + i]; if (v > bv) { bv = v; b = k; } } lab[i] = b; }
      self.postMessage({type: "result", id: m.id, lab}, [lab.buffer]);
    }
  } catch (err) {
    self.postMessage({type: "error", id: m.id, message: String((err && err.message) || err)});
  }
};
