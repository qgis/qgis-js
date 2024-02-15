# @qgis-js/utils

**Utilities to integrate [qgis-js](https://github.com/qgis/qgis-js) into web applications**

[qgis-js Repository](https://github.com/qgis/qgis-js) | [qgis-js Website](https://qgis.github.io/qgis-js) | ["`@qgis-js/utils`" package source](https://github.com/qgis/qgis-js/tree/main/packages/qgis-js-ol)

[![@qgis-js/utils on npm](https://img.shields.io/npm/v/@qgis-js/utils)](https://www.npmjs.com/package/@qgis-js/utils)

> ⚠️🧪 **Work in progress**! Currently this project is in public beta

## Installation

```bash
npm install -S @qgis-js/utils
```

## Usage

### `useProjects`

Provides an abstraction to load QGIS projects from various sources.

```js
import { qgis } from "qgis-js";
import { useProjects } from "@qgis-js/utils";

const { api, fs } = await qgis();
const {
  openProject,
  loadLocalProject,
  loadGithubProjects,
  loadRemoteProjects,
} = useProjects(fs, (projectPath: string) => {
  api.loadProject(projectPath);
});
```

The following project sources are supported:

#### LocalProject

Loads QGIS projects from the user's file system with the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)

```js
await openProject(await loadLocalProject());
```

#### GithubProject

Loads QGIS projects from a GitHub repository with the [GitHub API](https://docs.github.com/en/rest)

#### RemoteProject

Fetches QGIS projects from a remote server with the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

- If `loadRemoteProjects` is invoked with a string as, it is assumed to be the URL of a JSON file with the following structure:

```json
{
  "name": "projects",
  "path": "projects",
  "type": "Folder",
  "entries": [
    {
      "name": "village",
      "path": "projects/village",
      "type": "Folder",
      "entries": [
        {
          "name": "project.qgs",
          "path": "projects/village/project.qgs",
          "type": "File"
        },
        {
          "name": "rgb.tif",
          "path": "projects/village/rgb.tif",
          "type": "File"
        }
      ]
    }
  ]
}
```

- Otherwise a `Folder` object can also be passed directly to `loadRemoteProjects`, see [FileSystem.ts](./src/fs/FileSystem.ts)

## Versioning

This package uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/qgis/qgis-js/tags).

## License

[GNU General Public License v2.0](https://github.com/qgis/qgis-js/blob/main/LICENSE)
