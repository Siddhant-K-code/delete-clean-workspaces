"use strict";
/* eslint-disable  @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var core = require("@actions/core");
/**
 * Lists the workspaces from the Gitpod API and identifies those that should be deleted.
 * Workspaces are selected for deletion if they are stopped and do not have untracked or uncommitted files.
 *
 * @param {string} gitpodToken - The access token for Gitpod API.
 * @returns {Promise<string[]>} - A promise that resolves to an array of workspace IDs to be deleted.
 */
function listWorkspaces(gitpodToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response, workspaces, toDelete_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.post("https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/ListWorkspaces", {}, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer ".concat(gitpodToken),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    core.debug("API Response: " + JSON.stringify(response.data));
                    workspaces = response.data.result;
                    toDelete_1 = [];
                    if (!Array.isArray(workspaces)) {
                        throw new Error("Expected an array of data");
                    }
                    workspaces.forEach(function (workspace) {
                        var phaseStopped = workspace.status.instance.status.phase === "PHASE_STOPPED";
                        var hasNoUntrackedFiles = !("totalUntrackedFiles" in workspace.status.instance.status.gitStatus);
                        var hasNoUncommittedFiles = !("totalUncommittedFiles" in workspace.status.instance.status.gitStatus);
                        if (phaseStopped && hasNoUntrackedFiles && hasNoUncommittedFiles) {
                            toDelete_1.push(workspace.status.instance.workspaceId);
                        }
                    });
                    return [2 /*return*/, toDelete_1];
                case 2:
                    error_1 = _a.sent();
                    core.error("Error in listWorkspaces: ".concat(error_1));
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Deletes a specified workspace using the Gitpod API.
 *
 * @param {string} workspaceIdOfTargetWorkspace - The ID of the workspace to be deleted.
 * @param {string} gitpodToken - The access token for the Gitpod API.
 */
function deleteWorkspace(workspaceIdOfTargetWorkspace, gitpodToken) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.post("https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/DeleteWorkspace", { workspaceId: workspaceIdOfTargetWorkspace }, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer ".concat(gitpodToken),
                            },
                        })];
                case 1:
                    _a.sent();
                    core.debug("Deleted workspace: ".concat(workspaceIdOfTargetWorkspace));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    core.error("Error in deleteWorkspace: ".concat(error_2));
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main function to run the action. It retrieves the Gitpod access token,
 * lists workspaces, deletes the selected workspaces, and outputs the result.
 */
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var gitpodToken, deletedWorkspaces, workspacesToDelete, _i, workspacesToDelete_1, workspaceId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    gitpodToken = core.getInput("GITPOD_TOKEN", { required: true });
                    deletedWorkspaces = [];
                    if (!gitpodToken) {
                        throw new Error("Gitpod access token is required");
                    }
                    return [4 /*yield*/, listWorkspaces(gitpodToken)];
                case 1:
                    workspacesToDelete = _a.sent();
                    _i = 0, workspacesToDelete_1 = workspacesToDelete;
                    _a.label = 2;
                case 2:
                    if (!(_i < workspacesToDelete_1.length)) return [3 /*break*/, 5];
                    workspaceId = workspacesToDelete_1[_i];
                    return [4 /*yield*/, deleteWorkspace(workspaceId, gitpodToken)];
                case 3:
                    _a.sent();
                    deletedWorkspaces.push(workspaceId);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (deletedWorkspaces.length > 0) {
                        core.summary
                            .addHeading("Workspace IDs of deleted workspaces")
                            .addList(deletedWorkspaces)
                            .write();
                    }
                    core.setOutput("success", "true");
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    core.error(error_3.message);
                    core.setOutput("success", "false");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
run();
