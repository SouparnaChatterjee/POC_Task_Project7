import { runYosys, Exit as YosysExit }
    from 'https://cdn.jsdelivr.net/npm/@yowasp/yosys/gen/bundle.js';

// Tell main thread Yosys is loaded 
self.postMessage({ type: 'ready' });

// Listen for synthesis requests 
self.onmessage = async (e) => {
    const { verilog, topModule, requestId } = e.data;

    try {
        // Virtual filesystem: give Yosys our .v file
        const files = { 'input.v': verilog };

        // Build the Yosys script
        // block->logic, optimization,netlist
        const top    = topModule ? `; hierarchy -top ${topModule}` : '';
        const script = [
            'read_verilog input.v',
            'proc',
            'opt',
            top,
            'write_json output.json'
        ].filter(Boolean).join('; ');

        console.log('[worker] Running Yosys script:', script);

        const outputFiles = await runYosys(['-p', script], files);

        // Grab output (handle both key formats) 
        const raw =   outputFiles['output.json']
                   ?? outputFiles['/output.json']
                   ?? null;

        if (!raw) {
            const keys = Object.keys(outputFiles).join(', ') || '(none)';
            throw new Error(
                `output.json not found in Yosys output. Available: ${keys}`
            );
        }

        // Decode Uint8Array (string if needed)
        const jsonText = (raw instanceof Uint8Array || raw instanceof ArrayBuffer)
            ? new TextDecoder().decode(raw)
            : String(raw);

        const parsed = JSON.parse(jsonText);

        self.postMessage({ type: 'success', json: parsed, requestId });

    } catch (err) {
        if (err instanceof YosysExit) {
            self.postMessage({
                type: 'error',
                message: `Yosys process exited with code ${err.code}`,
                requestId
            });
        } else {
            self.postMessage({
                type: 'error',
                message: err.message || String(err),
                requestId
            });
        }
    }
};
