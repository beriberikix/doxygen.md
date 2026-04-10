import { generate, type GeneratedPage } from 'moxygen';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type Target = 'docusaurus' | 'mkdocs' | 'generic' | 'llm';

function loadTemplate(templatePath: string): HandlebarsTemplateDelegate {
  const source = readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(source);
}

function resolveTemplateDir(target: Target): string {
  return resolve(__dirname, 'templates', target);
}

/**
 * Generate documentation from Doxygen XML using moxygen and Handlebars templates.
 *
 * @param inputDir   Path to the Doxygen XML output directory.
 * @param outputPath Directory (for CMS targets) or file path (for llm target).
 * @param target     Presentation layer target.
 */
export async function generateDocs(
  inputDir: string,
  outputPath: string,
  target: Target
): Promise<void> {
  // Validate that the input directory exists.
  const resolvedInput = resolve(inputDir);
  if (!existsSync(resolvedInput)) {
    throw new Error(`Input directory "${resolvedInput}" does not exist.`);
  }

  const templateDir = resolveTemplateDir(target);

  if (target === 'llm') {
    await generateLlm(resolvedInput, outputPath, templateDir);
  } else {
    await generateCms(resolvedInput, outputPath, target, templateDir);
  }
}

/**
 * CMS targets (docusaurus, mkdocs, generic): output a directory of per-compound files
 * plus an index file.
 */
async function generateCms(
  inputDir: string,
  outputDir: string,
  target: Target,
  templateDir: string
): Promise<void> {
  const moxygenConfig = {
    directory: inputDir,
    classes: true,
    groups: true,
    anchors: true,
    quiet: true,
  };

  const pages: GeneratedPage[] = await generate(moxygenConfig);

  if (pages.length === 0) {
    throw new Error('No documentation pages were generated from the provided XML directory.');
  }

  // Ensure the output directory exists.
  mkdirSync(outputDir, { recursive: true });

  const compoundTemplate = loadTemplate(join(templateDir, 'compound.hbs'));
  const indexTemplate = loadTemplate(join(templateDir, 'index.hbs'));

  // Write one file per compound page.
  for (const page of pages) {
    const rendered = compoundTemplate(page);
    const filePath = join(outputDir, `${page.slug}.md`);
    writeFileSync(filePath, rendered, 'utf-8');
  }

  // Write an index file listing all pages.
  const indexRendered = indexTemplate({ pages, target });
  writeFileSync(join(outputDir, 'index.md'), indexRendered, 'utf-8');
}

/**
 * LLM target: single dense concatenated Markdown file, no frontmatter, no anchors.
 */
async function generateLlm(
  inputDir: string,
  outputPath: string,
  templateDir: string
): Promise<void> {
  const moxygenConfig = {
    directory: inputDir,
    classes: false,
    groups: false,
    anchors: false,
    quiet: true,
  };

  const pages: GeneratedPage[] = await generate(moxygenConfig);

  if (pages.length === 0) {
    throw new Error('No documentation pages were generated from the provided XML directory.');
  }

  const indexTemplate = loadTemplate(join(templateDir, 'index.hbs'));

  // Render all pages through the index template in a single pass.
  const content = indexTemplate(pages);

  // Ensure the parent directory of the output file exists.
  const outDir = dirname(outputPath);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(outputPath, content, 'utf-8');
}
