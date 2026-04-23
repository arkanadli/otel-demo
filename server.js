require('./tracing'); // OTel harus di-load duluan sebelum Express
const { trace, metrics } = require('@opentelemetry/api');
const net = require('net');

const express = require('express');
const app = express();

// ── Port monitoring → SigNoz metrics ──────────────────────────────────────
// const meter = metrics.getMeter('port-monitor');

// Simpan status port terakhir: { 3000: 1, 3001: 0, ... }
// const portStatus = {};

// // ObservableGauge: OTel akan "pull" nilai ini setiap kali metrik dikirim
// meter.createObservableGauge('port_status', {
//     description: 'Status port (1 = aktif, 0 = tidak aktif)',
// }).addCallback((result) => {
//     for (const [port, status] of Object.entries(portStatus)) {
//         result.observe(status, { port: String(port) });
//     }
// });

// function checkPort(port) {
//     return new Promise((resolve) => {
//         const socket = new net.Socket();
//         socket.setTimeout(1000);
//         socket
//             .on('connect', () => { socket.destroy(); resolve(true); })
//             .on('timeout',  () => { socket.destroy(); resolve(false); })
//             .on('error',    () => resolve(false))
//             .connect(port, '127.0.0.1');
//     });
// }

// async function monitorPorts(ports, intervalMs = 5000) {
//     async function check() {
//         for (const port of ports) {
//             const aktif = await checkPort(port);
//             portStatus[port] = aktif ? 1 : 0; // update nilai yang dibaca gauge
//             console.log(
//                 `🔍 Port ${port}: ${aktif ? '✅ AKTIF' : '❌ TIDAK AKTIF'}`
//             );
//         }
//     }

//     await check();
//     setInterval(check, intervalMs);
// }

// monitorPorts([3000, 3001]); // tambah port lain sesuai kebutuhan
// // ──────────────────────────────────────────────────────────────────────────

app.get('/test-api-signoz', async (req, res) => {
    res.send('Hello from OpenTelemetry Test!');
});

app.get('/slow', async (req, res) => {
    const tracer = trace.getTracer('manual-demo');

    await tracer.startActiveSpan('business-logic', async (parentSpan) => {

        tracer.startActiveSpan('validate-cart', async (span1) => {
            span1.setAttribute('cart.items', 3);
            await new Promise(r => setTimeout(r, 300));
            span1.end();
        });

        tracer.startActiveSpan('calculate-tax', async (span2) => {
            span2.setAttribute('tax.region', 'ID-JKT');
            await new Promise(r => setTimeout(r, 500));
            span2.end();
        });

        parentSpan.end();
    });

    res.send('Manual span recorded');
});

app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
});