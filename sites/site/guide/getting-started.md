# Gettings started

## Introduction

> **DISCLAIMER**: This project is in **early beta state**! It's dangerous to go alone! Take this 🗡️

### Compatibility

- **At the moment only Chromium based browser are supported**
- Firefox is a work in progress (see [TODO](http://mozilla.org))
- WebKit (e.g. Safari) isn't tested/supported yet

> _NOTE_: See [Compatibility](/docs/compatibility.md) for detailed information about the supported runtimes.

## Getting Started

### Minimal Example

To render your first map with **qgiswasm** you can use its API like so:

<!-- TODO include index.html from qgiswasm package -->

```html
<div id="shell"></div>
<script type="module">
  import { qgiswasm } from "https://unpkg.com/qgiswasm";
  qgiswasm("#shell").then(({ api }) => {
    api.openProject(
      "https://raw.githubusercontent.com/qgis/QGIS/master/tests/testdata/xyztiles.qgs",
    );
  });
</script>
<style lang="css">
  body,
  html,
  #shell {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: black;
  }
</style>
```

> _NOTE_: The [COOP and COEP headers](/docs/headers.md) have to be set from the web server.

### Vue/Vite Example

To use **qgiswasm** as an ES Module with a bundler like Vite (or Webpack, Rollup, etc.) install the `qgiswasm` npm package from the command line:

```bash
npm install qgiswasm --save
```

After a successful installation you can import the `qgiswasm`-API from the package:

```javascript
import { qgiswasm } from "qgiswasm";

const { api } = await qgiswasm("#shell");

api.openProject(
  "https://raw.githubusercontent.com/qgis/QGIS/master/tests/testdata/xyztiles.qgs",
);
```

Of course this can also be done inside a Vue "Single File Components" (SFCs). Have a look at the minimal example below:

```vue
<template>
  <div id="shell"></div>
</template>

<script>
export default {
  asnyc mounted() {
    const { api } = await qgiswasm("#shell");
    api.openProject("https://raw.githubusercontent.com/qgis/QGIS/master/tests/testdata/xyztiles.qgs");
  }
};
</script>

<style scoped>
#shell {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: black;
}
</style>
```

> _NOTE_: See [Bundling](/docs/bundling.md) for more information about how to include the necessary assets with your bundler. Also the [COOP and COEP headers](/docs/headers.md) have to be set from the web server.
