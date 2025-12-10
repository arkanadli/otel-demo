const fs = require("fs");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");

const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");

const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");

const { BatchLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");

const caCertPath = "/opt/otel-collector/ca.crt";

const httpsOptions = {
    ca: fs.readFileSync(caCertPath),
    rejectUnauthorized: true
};

// TRACE EXPORTER
const traceExporter = new OTLPTraceExporter({
    url: "https://10.17.17.42:4318/v1/traces",
    httpAgentOptions: httpsOptions
});

// METRICS EXPORTER
const metricExporter = new OTLPMetricExporter({
    url: "https://10.17.17.42:4318/v1/metrics",
    httpAgentOptions: httpsOptions
});

// LOG EXPORTER
const logExporter = new OTLPLogExporter({
    url: "https://10.17.17.42:4318/v1/logs",
    httpAgentOptions: httpsOptions
});

const sdk = new NodeSDK({
    serviceName: "test-dummy",

    // traces
    spanProcessor: new BatchSpanProcessor(traceExporter),

    // metrics
    metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5000,
    }),

    // logs
    logRecordProcessors: [
        new BatchLogRecordProcessor(logExporter)
    ],

    // auto-instrumentation
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
console.log("✅ OTel Trace + Metrics + Logs started (HTTPS + CA)");
