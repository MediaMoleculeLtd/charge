import test from "ava"
import dedent from "dedent"
import { join as pathJoin } from "path"
import build from "../../lib/build"
import {
  createData,
  createFiles,
  assertFiles,
  cleanFiles,
  tmpPathPrefix,
  dataDirectory,
  sourceDirectory,
  targetDirectory,
} from "../helpers/filesystem"

test.beforeEach((t) => cleanFiles(tmpPathPrefix))
test.after.always((t) => cleanFiles(tmpPathPrefix))

test("renders a JavaScript function into JSON", async (t) => {
  await createFiles(sourceDirectory, {
    "feed.json.js": dedent`
      export default () => {
        return { foo: "bar" }
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "feed.json": dedent`
      {
        "foo": "bar"
      }
    `,
  })
})

test("loads data from data files and passes it to the JavaScript function", async (t) => {
  createData(dataDirectory, {
    stuff: dedent`
      {
        "foo": "bar"
      }
    `,
  })

  await createFiles(sourceDirectory, {
    "feed.json.js": dedent`
      export default (props) => {
        return {
          foo: props.data.stuff.foo
        }
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "feed.json": dedent`
      {
        "foo": "bar"
      }
    `,
  })
})
