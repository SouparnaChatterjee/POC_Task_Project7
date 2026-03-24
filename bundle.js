import { yosys2digitaljs, io_ui } from 'yosys2digitaljs/core';
import { Circuit } from 'digitaljs';

window.renderCircuit = function(yosysJson, options) {
    const circuitData = yosys2digitaljs(yosysJson, options || {});
    io_ui(circuitData);
    
    const circuitDiv = document.getElementById('circuit');
    circuitDiv.innerHTML = '';
    
    const circuit = new Circuit(circuitData);
    circuit.displayOn(circuitDiv);
    circuit.start();
    
    return circuit;
};

window.circuitReady = true;
console.log('DigitalJS rendering ready');
