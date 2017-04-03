# generator-donejs

[![Build Status](https://travis-ci.org/donejs/generator-donejs.svg?branch=master)](https://travis-ci.org/donejs/generator-donejs)
[![npm version](https://badge.fury.io/js/generator-donejs.svg)](http://badge.fury.io/js/generator-donejs)
[![Coverage Status](https://coveralls.io/repos/github/donejs/generator-donejs/badge.svg?branch=master)](https://coveralls.io/github/donejs/generator-donejs?branch=master)

A Yeoman generator for your DoneJS application. Available generators are:

- `app` to create a new DoneJS application
- `plugin` to create a new DoneJS plugin
- `generator` to create a new DoneJS generator project

- `component` to create a CanJS component
- `supermodel` to create a can-connect connection
- `module` to generate a general purpose modlet

## Using generators

__Important:__ While this repository is a Yeoman generator it should only be used directly with the DoneJS cli instead of the `yo` command line.

With the CLI installed via

```shell
npm install donejs -g
```

The following commands are available. To initialize a new DoneJS related project:

- `donejs add app [projectname]` create a new DoneJS application
- `donejs add plugin [projectname]` create a new DoneJS plugin
- `donejs add generator [projectname]` create a new generator project

Within a DoneJS application or plugin:

- `donejs add component` to create a CanJS component
- `donejs add supermodel` to create a can-connect connection
- `donejs add module` to generate a general purpose modlet

## donejs add app

Creates a new DoneJS application. Running this command will install dependencies and initial configuration.

```shell
donejs add app <folder>
```

![donejs add app](https://cloud.githubusercontent.com/assets/361671/24613935/c3e8b98c-1857-11e7-8d44-c0615bebe4ce.png)

## Configuration

Most questions are to fill in values into the package.json and the defaults can be accepted. The following questions have special meaning:

### Project main folder

This specifies the folder where your application's source code is contained. By default the value is **src** creating a file structure like:

```shell
- my-awesome-app/
  |
  ├ src/
    ├ index.stache
```

## Generated folder

Using `donejs add app` will generate a folder that contains several files used for development. The following files are noteworthy:

### development.html

An HTML file used to view the application in development mode without requiring server-side rendering. You can use this file [instead of done-serve](https://github.com/donejs/done-serve) if your application doesn't require server-side rendering.

**development.html** uses hash based routing so that it can be used with any HTTP server.

![app using development.hml](https://cloud.githubusercontent.com/assets/361671/24617111/10b53962-1861-11e7-88dd-53cfa7ab4294.png)

### production.html

An HTML file that will load the application in production mode. This is useful to test the application's build without server-side rendering, or in cases where you do not need server-side rendering, to serve the application to the end users.

> *Note*: Opening this page before running `donejs build` will result in errors. Running that command should clear up the errors.

### build.js

This is the build script for generating bundles for deploying the application to production. It uses [steal-tools](https://github.com/stealjs/steal-tools) to create optimized bundles with progressive loading included by default.

> *Note*: This file is modified by some generators such as [donejs-cordova](https://github.com/donejs/donejs-cordova) but can be edited by you as well.

### src/index.stache

This is the root template for your application. Here you can:

* Add `<link>`, `<meta>` and `<title>` elements in the head.
* Use [`<can-import/>`](https://github.com/canjs/can-view-import) to import styles, define the Application ViewModel, import components, etc.

### src/app.js

This module defines and exports the Application ViewModel. The Application ViewModel is the root ViewModel for the application, containing any state that is global. Since apps created using `donejs add app` are automatically bound to [can-route](https://github.com/canjs/can-route), all properties on the Application ViewModel are bound to the URL by default.

This module is also where you will define your routes like so:

```js
import route from "can-route";

// Other stuff here...

route("{page}", { page: "home" });
```

## donejs add component

Generators a new [can-component](https://github.com/canjs/can-component) that can be used as a custom element in your application.

![donejs add component](https://cloud.githubusercontent.com/assets/361671/24618995/af601d52-1866-11e7-9586-506c102bed87.png)

There are two forms to using this command:

* `donejs add component <name>.component` will generate `src/name.component`. This is a single-file component using [done-component](https://github.com/donejs/done-component).
* `donejs add component <name>` will generator a folder `src/name/` with the files:
  * **name.js**: The JavaScript module.
  * **name.less**: A [less](http://lesscss.org/) file for the component's styles.
  * **name.stache**: A [stache](https://github.com/canjs/can-stache) template.
  * **name.html**: A demo page, used for developing this component in isolation.
  * **name-test.js**: A JavaScript module that contains unit tests (by default using [QUnit](https://qunitjs.com/)).
  * **test.html**: A page which runs the tests in **name-test.js**.
  * **name.md**: A markdown file, used to document the component.

## donejs add supermodel

Generates a [can-connect](https://github.com/canjs/can-connect) model. This model is an observable type, used to connect to a service layer.

![donejs add supermodel](https://cloud.githubusercontent.com/assets/361671/24619404/d7716f70-1867-11e7-96df-e3f46a1376f5.png)

## donejs add module

Creates a generic modlet. This modlet can be used for any purpose and contains:

* **foo.js**: The JavaScript module.
* **foo-test.js**: A JavaScript module for writing unit tests.
* **test.html**: A test page for running the tests in foo-test.js.
* **foo.md**: A markdown file, for documenting the modlet.

## donejs add plugin

Generates a new plugin project. This is useful for creating DoneJS plugins or any open-source project that uses StealJS and the modlet pattern.

Like `donejs add app`, the plugin generator scaffolds a project and puts the source code in a `src/` folder (you can specify a different folder when running the generator).

```shell
donejs add plugin awesome-plugin
```

## donejs add generator

Generators a new generator project. Learn more about writing a generator in [the generator guide](http://donejs.com/generator.html).
