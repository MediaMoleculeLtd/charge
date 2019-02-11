import HTMLFile from "./html"
import mdxImportParser from "../import-parsers/mdx"
import mdxBuilder from "../builders/mdx"

class MDXFile extends HTMLFile {
  get importedDependencyPaths() {
    return mdxImportParser(this.path)
  }

  get outputPath() {
    let extension = super.extensions.slice(-1)[0]
    return super.outputPath.replace(`.${extension}`, "")
  }

  build(data) {
    return mdxBuilder(this.path, data)
  }

  get isComponent() {
    return true
  }
}

HTMLFile.registerFileType({
  extension: ".html.mdx",
  klass: MDXFile,
})

export default MDXFile
