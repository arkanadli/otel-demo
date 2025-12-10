const fs = require('fs');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const caCertPath = '/opt/otel-collector/collector.crt';


const traceExporter = new OTLPTraceExporter({
    // url: 'https://10.17.17.42:4318/v1/traces',
    url: 'https://10.17.17.42:4318',
    // url: 'http://20.255.49.241:4317',

    // Tambahkan ini untuk HTTPS + custom CA
    httpsAgentOptions: {
        ca: fs.readFileSync(caCertPath),
        rejectUnauthorized: true, // wajib true kalau certificate valid
    }
});

const sdk = new NodeSDK({
    serviceName: 'test-dummy',
    spanProcessor: new BatchSpanProcessor(traceExporter),
    instrumentations: [getNodeAutoInstrumentations()],
});

// --> FIX: tidak pakai .then()
sdk.start();

console.log("✅ OpenTelemetry (HTTP 4318) → SigNoz Collector started");
