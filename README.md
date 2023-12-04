# Gitpod Workspace Cleanup - GitHub Action

This GitHub Action is designed to manage Gitpod workspaces. It automatically deletes workspaces that are stopped and do not have any uncommitted or untracked file changes.

> [!NOTE]
> `GITPOD_TOKEN`: Required. The access token for Gitpod API. [Learn more](https://www.gitpod.io/docs/configure/user-settings/access-tokens).

## Usage

[**Demo repository**](https://github.com/Siddhant-K-code/demo-delete-clean-workspaces)

```yaml
name: Delete clean Gitpod workspaces weekly

on:
  workflow_dispatch:
  schedule:
    - cron: "0 9 * * MON" # At 9 AM UTC, weekly only on Monday

jobs:
  delete-clean-workspaces:
    name: Clean Gitpod workspaces weekly
    runs-on: ubuntu-latest
    steps:
      - name: Delete clean Gitpod workspaces
        uses: Siddhant-K-code/delete-clean-workspaces@v1.1
        with:
          GITPOD_TOKEN: ${{ secrets.GITPOD_PAT_TOKEN }}
          PRINT_SUMMARY: true # Print summary of deleted workspaces. Optional & defaults to false
```
