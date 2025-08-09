import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import path from "node:path";
import minifyHtml from "@minify-html/node";
import { transform } from "lightningcss";

const CSS_OUTPUT_FILENAME = "style.min.css";
const OUTPUT_FOLDER = "./dist";

const createFileWithFolder = async (filePath, content) => {
  const dirPath = path.dirname(filePath);
  // Create all parent directories if they don't exist
  await fs.mkdir(dirPath, { recursive: true });
  // Write the file
  await fs.writeFile(filePath, content, "utf8");
};

const buildFinalPath = (filename) => {
  return OUTPUT_FOLDER + "/" + filename;
};

async function buildHtml() {
  try {
    // Read the HTML file
    const htmlContent = (await fs.readFile("./index.html", "utf8")).replace(
      "style.css",
      CSS_OUTPUT_FILENAME,
    );

    // Minify the HTML
    const minified = minifyHtml.minify(Buffer.from(htmlContent), {
      keep_spaces_between_attributes: true,
      keep_comments: true,
      minify_css: false,
    });

    // Convert buffer back to string for output
    const minifiedHtml = minified.toString();

    // Read CSS file
    let css = "";
    const cssFiles = await fs.readdir("./styles");
    for (const file of cssFiles) {
      const cssContent = await fs.readFile(`./styles/${file}`, "utf-8");
      let { code } = transform({
        filename: CSS_OUTPUT_FILENAME,
        code: Buffer.from(cssContent),
        minify: true,
      });
      css += `\n${code.toString()}`;
    }

    const finalHtmlPath = buildFinalPath("index.html");
    const finalCssPath = buildFinalPath(CSS_OUTPUT_FILENAME);

    // Optionally save to a file
    await createFileWithFolder(finalCssPath, css);
    await createFileWithFolder(finalHtmlPath, minifiedHtml);

    console.log(`\nMinified HTML saved to ${finalHtmlPath}`);
    console.log(`Minified CSS saved to ${finalCssPath}`);
  } catch (error) {
    console.error("Error minifying HTML:", error);
  }
}

buildHtml();
