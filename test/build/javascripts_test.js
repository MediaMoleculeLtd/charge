import test from "ava"
import dedent from "dedent"
import build from "../../lib/build"
import { createData, createFiles, assertFiles, cleanFiles } from "../helpers/filesystem"

let tmpPathPrefix = "tmp/tests"
let sourceDirectory = `${tmpPathPrefix}/source`
let targetDirectory = `${tmpPathPrefix}/target`

test.beforeEach((t) => {
  cleanFiles(tmpPathPrefix)
})

test("bundles JavaScripts into a self-executing function", async (t) => {
  createFiles(sourceDirectory, {
    "index.js": dedent`
      console.log("hey")
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.js": dedent`
      (function () {
        'use strict';

        console.log("hey");

      }());\n
    `,
  })

  cleanFiles(tmpPathPrefix)
})

test("transpiles JavaScripts using Babel", async (t) => {
  createFiles(sourceDirectory, {
    "index.js": dedent`
      console.log([1, ...[2]])
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.js": dedent`
      (function () {
        'use strict';

        console.log([1].concat([2]));

      }());\n
    `,
  })

  cleanFiles(tmpPathPrefix)
})

test("bundles imported JavaScript files", async (t) => {
  createFiles(sourceDirectory, {
    "foo.js": dedent`
      export default "bar"
    `,
    "index.js": dedent`
      import foo from  "./foo"

      console.log(foo)
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.js": dedent`
      (function () {
        'use strict';

        var foo = "bar";

        console.log(foo);

      }());\n
    `,
  })

  cleanFiles(tmpPathPrefix)
})
