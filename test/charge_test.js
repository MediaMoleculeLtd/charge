import test from "ava"
import dedent from "dedent"
import fs from "node-fs-extra"
import charge from "../lib/charge"
import { createData, createFiles, assertFiles, cleanFiles } from "./helpers/filesystem"

let tmpPathPrefix = "tmp/tests"

test.beforeEach((t) => {
	cleanFiles(tmpPathPrefix)
})

test("copies a file from source to target", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "index.html": "<html></html>"
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<html></html>"
  })

  cleanFiles(tmpPathPrefix)
})

test("copies an HTML file into a Directory Index format for clean URLs", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "foobar.html": "<html></html>",
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    foobar: {
      "index.html": "<html></html>",
    },
  })

  cleanFiles(tmpPathPrefix)
})

test("does not copy the root index.html file into a Directory Index format for clean URLs", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "index.html": "<html></html>",
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<html></html>",
  })

  cleanFiles(tmpPathPrefix)
})

test("renders a JSX template as HTML", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "index.html.jsx": dedent`
      import React from "react"

      export default class extends React.Component {

        render() {
          return <html></html>
        }

      }
    `
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<html></html>",
  })

  cleanFiles(tmpPathPrefix)
})

test("renders a JSX template as an HTML file into a Directory Index format for clean URLs", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "foobar.html.jsx": dedent`
      import React from "react"

      export default class extends React.Component {

        render() {
          return <html></html>
        }

      }
    `
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    foobar: {
      "index.html": "<html></html>",
    },
  })

  cleanFiles(tmpPathPrefix)
})

test("renders a JSX template as HTML with a component", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "paragraph-component.html.jsx": dedent`
      import React from "react"

      export default (props) => {
        return <p>{props.foo}</p>
      }
    `,
    "index.html.jsx": dedent`
      import React from "react"
      import ParagraphComponent from "./paragraph-component.html.jsx"

      export default class extends React.Component {

        render() {
          return (
            <html><ParagraphComponent foo="bar" /></html>
          )
        }

      }
    `
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<html><p>bar</p></html>",
  })

  cleanFiles(tmpPathPrefix)
})

test("renders a JSX template as HTML with a component as a layout", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "layout-component.html.jsx": dedent`
      import React from "react"

      export default (props) => {
        return <html>{props.children}</html>
      }
    `,
    "index.html.jsx": dedent`
      import React from "react"
      import LayoutComponent from "./layout-component.html.jsx"

      export default class extends React.Component {

        render() {
          return (
            <LayoutComponent>
              <p>foobar</p>
            </LayoutComponent>
          )
        }

      }
    `
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<html><p>foobar</p></html>",
  })

  cleanFiles(tmpPathPrefix)
})

test("loads data from data files and passes it to the JSX template", async (t) => {
  let dataDirectory = `${tmpPathPrefix}/data`
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createData(dataDirectory, {
    stuff: dedent`
      {
        "foo": "bar"
      }
    `
  })

  createFiles(sourceDirectory, {
    "index.html.jsx": dedent`
      import React from "react"

      export default class extends React.Component {

        render() {
          return <p>{this.props.data.stuff.foo}</p>
        }

      }
    `
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.html": "<p>bar</p>",
  })

  cleanFiles(tmpPathPrefix)
})

test("transpiles stylesheets using cssnext", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "index.css": dedent`
      :root {
        --mainColor: red;
      }

      a {
        color: var(--mainColor);
      }
    `,
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.css": dedent`
      a {
        color: red;
      }
    `,
  })

  cleanFiles(tmpPathPrefix)
})

test("inlines stylesheets referenced via @import statements", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "other.css": dedent`
      p {
        color: red;
      }
    `,
    "index.css": dedent`
      @import "./other.css";

      a {
        color: black;
      }
    `,
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.css": dedent`
      p {
        color: red;
      }

      a {
        color: black;
      }
    `,
  })

  cleanFiles(tmpPathPrefix)
})

test("transpiles JavaScripts using Babel", async (t) => {
  let sourceDirectory = `${tmpPathPrefix}/source`
  let targetDirectory = `${tmpPathPrefix}/target`

  createFiles(sourceDirectory, {
    "index.js": dedent`
      [1, ...[2]]
    `,
  })

  await charge.build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  assertFiles(t, targetDirectory, {
    "index.js": dedent`
      "use strict";

      [1].concat([2]);
    `,
  })

  cleanFiles(tmpPathPrefix)
})
