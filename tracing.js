const fs = require("fs");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");

// TRACE
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// METRICS
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

// LOGS
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { LoggerProvider, BatchLogRecordProcessor } = require("@opentelemetry/sdk-logs");

const caCertPath = "/opt/otel-collector/ca.crt";

// ---------------------------
// HTTPS + Custom CA CONFIG
// ---------------------------
const httpsOptions = {
    ca: fs.readFileSync(caCertPath),
    rejectUnauthorized: true
};

// ---------------------------
// TRACE EXPORTER
// ---------------------------
const traceExporter = new OTLPTraceExporter({
    url: "https://10.17.17.42:4318/v1/traces",
    httpAgentOptions: httpsOptions
});

// ---------------------------
// METRIC EXPORTER
// ---------------------------
const metricExporter = new OTLPMetricExporter({
    url: "https://10.17.17.42:4318/v1/metrics",
    httpAgentOptions: httpsOptions
});

// ---------------------------
// LOG EXPORTER
// ---------------------------
const logExporter = new OTLPLogExporter({
    url: "https://10.17.17.42:4318/v1/logs",
    httpAgentOptions: httpsOptions
});

// Logger provider
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));


// ---------------------------
// NODE SDK
// ---------------------------
const sdk = new NodeSDK({
    serviceName: "test-dummy",
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5000, // export tiap 5 detik
    }),
    loggerProvider,
    instrumentations: [getNodeAutoInstrumentations()],
});

// Start SDK
sdk.start();
console.log("✅ OTel Started → Trace + Metrics + Logs → HTTPS");
