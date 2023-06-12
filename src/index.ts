import * as fs from 'fs';
import * as yaml from 'yaml';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

interface Job {
  name?: string;
  uses?: unknown;
  'timeout-minutes'?: number;
}

interface Jobs {
  [jobId: string]: Job;
}

interface ActionsWorkflow {
  name?: string;
  jobs?: Jobs;
}

interface JobValidationResult {
  jobId: string;
  name?: string;
  reason: 'not defined' | 'not a number';
}

async function parseYaml(filename: string): Promise<ActionsWorkflow | null> {
  try {
    return yaml.parse(await fs.promises.readFile(filename, 'utf8')) as ActionsWorkflow;
  } catch (e) {
    core.debug(String(e));
    return null;
  }
}

function validate(jobs: Jobs): JobValidationResult[] | null {
  const result: JobValidationResult[] = [];

  for (const [jobId, job] of Object.entries(jobs)) {
    if (!job) {
      continue;
    }

    if (job.uses) {
      continue;
    }

    if (job['timeout-minutes'] === void 0) {
      result.push({ jobId, name: job.name, reason: 'not defined' });
      continue;
    }

    if (typeof job['timeout-minutes'] !== 'number') {
      result.push({ jobId, name: job.name, reason: 'not a number' });
    }
  }

  return result.length === 0 ? null : result;
}

async function run(): Promise<void> {
  try {
    const exts = ['.yml', '.yaml'];
    const globber = await glob.create(exts.map((ext) => `.github/workflows/**/*${ext}`).join('\n'));
    const workflowFiles = await globber.glob();

    const resultMessage: string[] = [];

    for (const path of workflowFiles) {
      const filename = path.substring(path.lastIndexOf('.github/workflows/'));
      core.startGroup(`File: ${filename}`);

      const yamlDoc = await parseYaml(path);
      if (yamlDoc === null) {
        core.info('Unable to parse YAML.');
        core.endGroup();
        continue;
      }

      if (typeof yamlDoc.jobs !== 'object') {
        core.info('Property "jobs" does not exist.');
        core.endGroup();
        continue;
      }

      const jobResults = validate(yamlDoc.jobs);
      if (jobResults === null) {
        core.info('Pass');
        core.endGroup();
        continue;
      }

      for (const jobResult of jobResults) {
        const message =
          jobResult.reason === 'not defined'
            ? `[${filename} :: ${jobResult.jobId}] Property "timeout-minutes" does not exist.`
            : `[${filename} :: ${jobResult.jobId}] Value of the property "timeout-minutes" is not a number.`;
        core.error(message);
        resultMessage.push(message);
      }

      core.endGroup();
    }

    if (resultMessage.length !== 0) {
      core.setOutput('message', resultMessage.join('\n'));
      core.setFailed(`${resultMessage.length} violation${resultMessage.length > 0 ? 's' : ''} found.`);
    }
  } catch (error) {
    const msg = typeof error === 'object' && error !== null && 'message' in error ? error.message : error;
    core.setFailed(String(msg));
  }
}

run();
