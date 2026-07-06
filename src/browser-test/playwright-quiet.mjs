import { spawn } from 'node:child_process';
import { join } from 'node:path';

const result = await runPlaywrightJson();

if (result.exitCode === 0) {
  console.log('OK');
  process.exit(0);
}

const report = parseReport(result.stdout);
const failedSpecs = collectFailedSpecs(report);

if (failedSpecs.length === 0) {
  console.log('Browser tests failed.');
  const firstErrorLine = firstRelevantLine(result.stderr);

  if (firstErrorLine != null) {
    console.log(firstErrorLine);
  }

  process.exit(result.exitCode);
}

for (const spec of failedSpecs) {
  console.log(`FAILED: ${spec.title}`);

  if (spec.message != null && spec.message.length > 0) {
    console.log(spec.message);
  }
}

console.log(`${collectSpecCount(report)} tests completed, ${failedSpecs.length} failed`);
process.exit(result.exitCode);

function runPlaywrightJson() {
  return new Promise((resolve) => {
    const child = spawn(
        process.execPath,
        [playwrightExecutable(), 'test', '--reporter=json'],
        {
          cwd: process.cwd(),
          windowsHide: true,
        });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });
    child.stderr.on('data', (data) => {
      stderr += data;
    });
    child.on('close', (exitCode) => {
      resolve({
        exitCode: exitCode ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

function playwrightExecutable() {
  return join(
      process.cwd(),
      'node_modules',
      'playwright',
      'cli.js');
}

function parseReport(output) {
  try {
    return JSON.parse(output);
  } catch {
    return null;
  }
}

function collectFailedSpecs(report) {
  return collectSpecs(report).filter((spec) => spec.failed);
}

function collectSpecCount(report) {
  return collectSpecs(report).length;
}

function collectSpecs(suite) {
  if (suite == null || typeof suite !== 'object') {
    return [];
  }

  return [
    ...(suite.suites ?? []).flatMap((childSuite) => collectSpecs(childSuite)),
    ...(suite.specs ?? []).map((spec) => {
      const results = (spec.tests ?? []).flatMap((test) => test.results ?? []);
      const failedResult = results.find((result) => (
        ['failed', 'timedOut', 'interrupted'].includes(result.status)
      ));

      return {
        title: spec.title,
        failed: failedResult != null || spec.ok === false,
        message: firstPlaywrightErrorMessage(failedResult),
      };
    }),
  ];
}

function firstPlaywrightErrorMessage(result) {
  if (result == null || typeof result !== 'object') {
    return null;
  }

  const message = result.error?.message
      ?? result.errors?.find((error) => error.message != null)?.message;

  if (message == null) {
    return null;
  }

  return message
      .split(/\r?\n/)
      .find((line) => line.trim().length > 0);
}

function firstRelevantLine(output) {
  return output
      .split(/\r?\n/)
      .find((line) => line.trim().length > 0);
}
