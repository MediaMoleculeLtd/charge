import test from "ava"
import dedent from "dedent"
import build from "../../lib/build"
import { join as pathJoin } from "path"
import {
  createData,
  createSourceFiles,
  cleanFiles,
  dataDirectory,
  snapshotFilesystem,
  sourceDirectory,
  targetDirectory,
} from "../helpers/filesystem"

test.beforeEach((t) => cleanFiles())
test.after.always((t) => cleanFiles())

test("renders a JSX page as HTML", async (t) => {
  await createSourceFiles({
    "index.html.jsx": dedent`
      export default () => {
        return <div></div>
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  snapshotFilesystem(t)
})

test("renders a JSX page as HTML with a JSX component", async (t) => {
  await createSourceFiles({
    "paragraph-component.html.jsx": dedent`
      export default (props) => {
        return <p>{props.foo}</p>
      }
    `,
    "index.html.jsx": dedent`
      import ParagraphComponent from "./paragraph-component.html.jsx"

      export default () => {
        return (
          <div>
            <ParagraphComponent foo="bar" />
          </div>
        )
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  snapshotFilesystem(t)
})

test("renders a JSX page as HTML with an MDX component", async (t) => {
  await createSourceFiles({
    "subheading.html.mdx": dedent`
      ## Subheading
    `,
    "index.html.jsx": dedent`
      import Subheading from "./subheading.html.mdx"

      export default () => {
        return (
          <div>
            <h1>Heading</h1>

            <Subheading />
          </div>
        )
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  snapshotFilesystem(t)
})

test("renders a JSX page as HTML with a JSX component as a layout", async (t) => {
  await createSourceFiles({
    "layout-component.html.jsx": dedent`
      export default (props) => {
        return <div>{props.children}</div>
      }
    `,
    "index.html.jsx": dedent`
      import LayoutComponent from "./layout-component.html.jsx"

      export default () => {
        return (
          <LayoutComponent>
            <p>foobar</p>
          </LayoutComponent>
        )
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  snapshotFilesystem(t)
})

test("loads data from data files and passes it to the JSX page", async (t) => {
  await createData({
    stuff: dedent`
      {
        "foo": "bar"
      }
    `,
  })

  await createSourceFiles({
    "index.html.jsx": dedent`
      export default (props) => {
        return <p>{props.data.stuff.foo}</p>
      }
    `,
  })

  await build({
    source: sourceDirectory,
    target: targetDirectory,
  })

  snapshotFilesystem(t)
})
