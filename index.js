// @ts-check

const { performance: { now } } = require("perf_hooks");
const cp = require("child_process");
const stats = require("simple-statistics");

const runCount = +process.argv[2] || 10;

console.log("Warming up");
const error = run();
if (error) {
    console.log("Compilation failed:");
    console.log(error);
}

const times = [];

for (let i = 0; i < runCount; i++) {
    console.log(`Starting run ${i + 1}`);

    const start = now();
    run();
    const end = now();
    times.push(Math.round(end - start)); // It's silly to pretend we have more than millisecond precision
}

console.log();
console.log("Summary statistics");
console.log(`Median (ms): ${stats.median(times)}`);
console.log(`Min (ms): ${stats.min(times)}`);
console.log(`Max (ms): ${stats.max(times)}`);

const mean = stats.mean(times);
console.log(`Mean (ms): ${mean}`);
console.log(`Coefficient of Variation: ${(stats.sampleStandardDeviation(times) / mean).toFixed(3)}`);

console.log();
console.log("Raw times (ms)");
console.log(times.join(","));

function run() {
    try {
        cp.execSync(`"${process.argv[0]}" --max-old-space-size=4095 ./node_modules/typescript/lib/tsc.js -p ./ant-design -incremental false -skipLibCheck`, { encoding: "utf-8", cwd: __dirname });
    }
    catch (e) {
        return e.stdout;
    }
}