require('./tracing'); // penting → OTel harus di-load dulu sebelum Express
const { trace } = require('@opentelemetry/api');

const express = require('express');
const app = express();

app.get('/test-api-signoz', async (req, res) => {

    res.send('Hello from OpenTelemetry Test!');
});

app.get('/slow', async (req, res) => {
    const tracer = trace.getTracer('manual-demo');

    await tracer.startActiveSpan('business-logic', async (parentSpan) => {

        // Child span
        tracer.startActiveSpan('validate-cart', async (span1) => {
            span1.setAttribute('cart.items', 3);
            await new Promise(r => setTimeout(r, 300));
            span1.end();
        })


        // Child span 2
        tracer.startActiveSpan('calculate-tax', async (span2) => {
            span2.setAttribute('tax.region', 'ID-JKT');
            await new Promise(r => setTimeout(r, 500));
            span2.end();
        })

        parentSpan.end();
    })
    res.send('Manual span recorded');
});

app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
});
