"use strict";
/* eslint-disable  @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Lists the workspaces from the Gitpod API and identifies those that should be deleted.
 * Workspaces are selected for deletion if they are stopped and do not have untracked or uncommitted files.
 *
 * @param {string} gitpodToken - The access token for Gitpod API.
 * @returns {Promise<string[]>} - A promise that resolves to an array of workspace IDs to be deleted.
 */
function listWorkspaces(gitpodToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/ListWorkspaces", {}, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${gitpodToken}`,
                },
            });
            core.debug("API Response: " + JSON.stringify(response.data));
            const workspaces = response.data.result;
            const toDelete = [];
            if (!Array.isArray(workspaces)) {
                throw new Error("Expected an array of data");
            }
            workspaces.forEach((workspace) => {
                const phaseStopped = workspace.status.instance.status.phase === "PHASE_STOPPED";
                const hasNoUntrackedFiles = !("totalUntrackedFiles" in workspace.status.instance.status.gitStatus);
                const hasNoUncommittedFiles = !("totalUncommittedFiles" in workspace.status.instance.status.gitStatus);
                if (phaseStopped && hasNoUntrackedFiles && hasNoUncommittedFiles) {
                    toDelete.push(workspace.status.instance.workspaceId);
                }
            });
            return toDelete;
        }
        catch (error) {
            core.error(`Error in listWorkspaces: ${error}`);
            throw error;
        }
    });
}
/**
 * Deletes a specified workspace using the Gitpod API.
 *
 * @param {string} workspaceIdOfTargetWorkspace - The ID of the workspace to be deleted.
 * @param {string} gitpodToken - The access token for the Gitpod API.
 */
function deleteWorkspace(workspaceIdOfTargetWorkspace, gitpodToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield axios_1.default.post("https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/DeleteWorkspace", { workspaceId: workspaceIdOfTargetWorkspace }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${gitpodToken}`,
                },
            });
            core.debug(`Deleted workspace: ${workspaceIdOfTargetWorkspace}`);
        }
        catch (error) {
            core.error(`Error in deleteWorkspace: ${error}`);
            throw error;
        }
    });
}
/**
 * Main function to run the action. It retrieves the Gitpod access token,
 * lists workspaces, deletes the selected workspaces, and outputs the result.
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gitpodToken = core.getInput("GITPOD_TOKEN", { required: true });
            const deletedWorkspaces = [];
            if (!gitpodToken) {
                throw new Error("Gitpod access token is required");
            }
            const workspacesToDelete = yield listWorkspaces(gitpodToken);
            for (const workspaceId of workspacesToDelete) {
                yield deleteWorkspace(workspaceId, gitpodToken);
                deletedWorkspaces.push(workspaceId);
            }
            if (deletedWorkspaces.length > 0) {
                core.summary
                    .addHeading("Workspace IDs of deleted workspaces")
                    .addList(deletedWorkspaces)
                    .write();
            }
            core.setOutput("success", "true");
        }
        catch (error) {
            core.error(error.message);
            core.setOutput("success", "false");
        }
    });
}
run();
