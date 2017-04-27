# <%= name %>

[![Build Status](https://travis-ci.org/<%= githubAccount %>/<%= name %>.svg?branch=master)](https://travis-ci.org/<%= githubAccount %>/<%= name %>)

<%= description %>

## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from '<%= name %>';
```

### CommonJS use

Use `require` to load `<%= name %>` and everything else
needed to create a template that uses `<%= name %>`:

```js
var plugin = require("<%= name %>");
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/<%= name %>/dist/global/<%= name %>.js'></script>
```
