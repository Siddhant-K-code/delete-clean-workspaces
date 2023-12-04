/* eslint-disable  @typescript-eslint/no-explicit-any */

import axios from "axios";
import * as core from "@actions/core";

/**
 * Lists the workspaces from the Gitpod API and identifies those that should be deleted.
 * Workspaces are selected for deletion if they are stopped and do not have untracked or uncommitted files.
 *
 * @param {string} gitpodToken - The access token for Gitpod API.
 * @returns {Promise<string[]>} - A promise that resolves to an array of workspace IDs to be deleted.
 */

async function listWorkspaces(gitpodToken: string) {
  try {
    const response = await axios.post(
      "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/ListWorkspaces",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gitpodToken}`,
        },
      }
    );

    core.debug("API Response: " + JSON.stringify(response.data));

    const workspaces = response.data.result;
    const toDelete: string[] = [];

    if (!Array.isArray(workspaces)) {
      throw new Error("Expected an array of data");
    }

    workspaces.forEach((workspace) => {
      const phaseStopped =
        workspace.status.instance.status.phase === "PHASE_STOPPED";
      const hasNoUntrackedFiles = !(
        "totalUntrackedFiles" in workspace.status.instance.status.gitStatus
      );
      const hasNoUncommittedFiles = !(
        "totalUncommittedFiles" in workspace.status.instance.status.gitStatus
      );

      if (phaseStopped && hasNoUntrackedFiles && hasNoUncommittedFiles) {
        toDelete.push(workspace.status.instance.workspaceId);
      }
    });

    return toDelete;
  } catch (error) {
    core.error(`Error in listWorkspaces: ${error}`);
    throw error;
  }
}

/**
 * Deletes a specified workspace using the Gitpod API.
 *
 * @param {string} workspaceIdOfTargetWorkspace - The ID of the workspace to be deleted.
 * @param {string} gitpodToken - The access token for the Gitpod API.
 */

async function deleteWorkspace(
  workspaceIdOfTargetWorkspace: string,
  gitpodToken: string
) {
  try {
    await axios.post(
      "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/DeleteWorkspace",
      { workspaceId: workspaceIdOfTargetWorkspace },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gitpodToken}`,
        },
      }
    );
    core.debug(`Deleted workspace: ${workspaceIdOfTargetWorkspace}`);
  } catch (error) {
    core.error(`Error in deleteWorkspace: ${error}`);
    throw error;
  }
}

/**
 * Main function to run the action. It retrieves the Gitpod access token,
 * lists workspaces, deletes the selected workspaces, and outputs the result.
 */

async function run() {
  try {
    const gitpodToken = core.getInput("GITPOD_TOKEN", { required: true });
    const printSummary = core.getBooleanInput("PRINT_SUMMARY", { required: false });
    const deletedWorkspaces: string[] = [];

    if (!gitpodToken) {
      throw new Error("Gitpod access token is required");
    }

    const workspacesToDelete = await listWorkspaces(gitpodToken);
    for (const workspaceId of workspacesToDelete) {
      await deleteWorkspace(workspaceId, gitpodToken);
      printSummary ? deletedWorkspaces.push(workspaceId) : null;
    }

    if (deletedWorkspaces.length > 0 && printSummary) {
      core.summary
        .addHeading("Workspace IDs of deleted workspaces")
        .addList(deletedWorkspaces)
        .write();
    }

    core.setOutput("success", "true");
  } catch (error) {
    core.error((error as Error).message);
    core.setOutput("success", "false");
  }
}

run();
