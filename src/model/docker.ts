import { existsSync, mkdirSync } from 'fs';
import { exec } from '@actions/exec';
import path from 'path';

const Docker = {
  async run(image, parameters, silent = false) {
    const {
      actionFolder,
      editorVersion,
      workspace,
      projectPath,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      useHostNetwork,
      sshAgent,
      gitPrivateToken,
      githubToken,
      runnerTemporaryPath,
    } = parameters;

    const githubHome = path.join(runnerTemporaryPath, '_github_home');
    if (!existsSync(githubHome)) mkdirSync(githubHome);
    const githubWorkflow = path.join(runnerTemporaryPath, '_github_workflow');
    if (!existsSync(githubWorkflow)) mkdirSync(githubWorkflow);
    const testPlatforms = (
      testMode === 'all' ? ['playmode', 'editmode', 'COMBINE_RESULTS'] : [testMode]
    ).join(';');

    const command = `docker run \
        --workdir /github/workspace \
        --rm \
        --env UNITY_LICENSE \
        --env UNITY_LICENSE_FILE \
        --env UNITY_EMAIL \
        --env UNITY_PASSWORD \
        --env UNITY_SERIAL \
        --env UNITY_VERSION="${editorVersion}" \
        --env PROJECT_PATH="${projectPath}" \
        --env CUSTOM_PARAMETERS="${customParameters}" \
        --env TEST_PLATFORMS="${testPlatforms}" \
        --env COVERAGE_OPTIONS="${coverageOptions}" \
        --env COVERAGE_RESULTS_PATH="CodeCoverage" \
        --env ARTIFACTS_PATH="${artifactsPath}" \
        --env GITHUB_REF \
        --env GITHUB_SHA \
        --env GITHUB_REPOSITORY \
        --env GITHUB_ACTOR \
        --env GITHUB_WORKFLOW \
        --env GITHUB_HEAD_REF \
        --env GITHUB_BASE_REF \
        --env GITHUB_EVENT_NAME \
        --env GITHUB_WORKSPACE=c:/github/workspace \
        --env GITHUB_ACTION \
        --env GITHUB_EVENT_PATH \
        --env RUNNER_OS \
        --env RUNNER_TOOL_CACHE \
        --env RUNNER_TEMP \
        --env RUNNER_WORKSPACE \
        --env GIT_PRIVATE_TOKEN="${gitPrivateToken}" \
        ${sshAgent ? '--env SSH_AUTH_SOCK=/ssh-agent' : ''} \
        --volume "${workspace}":"c:/github/workspace" \
        --volume "${workspace}":"c:/github/workspace" \
        --volume "${actionFolder}/steps":"c:/steps" \
        --volume "${actionFolder}/entrypoint.sh":"c:/entrypoint.sh" \
        ${sshAgent ? `--volume ${sshAgent}:c/ssh-agent` : ''} \
        ${useHostNetwork ? '--net=host' : ''} \
        ${githubToken ? '--env USE_EXIT_CODE=false' : '--env USE_EXIT_CODE=true'} \
        ${image} \
        bash c:/entrypoint.sh`;

    await exec(command, undefined, { silent });
  },
};

export default Docker;
