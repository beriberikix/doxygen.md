# doxygen.md

A CLI tool (`dox2md`) that acts as a multi-target documentation router. It takes **Doxygen XML** output as input and uses the [moxygen](https://github.com/sourcey/moxygen) library programmatically to generate Markdown tailored for different presentation layers.

## Supported Targets

| Target | Description | Output |
|--------|-------------|--------|
| `docusaurus` | Docusaurus-ready Markdown with YAML frontmatter (`id`, `title`) | Directory of `.md` files |
| `mkdocs` | MkDocs-compatible Markdown | Directory of `.md` files |
| `generic` | Plain Markdown | Directory of `.md` files |
| `llm` | Ultra-dense single-file for LLM context (e.g. `llms.txt`) | Single file |

## Installation

```bash
npm install -g doxygen.md
```

## Usage

```bash
dox2md -t <target> -i <xml-dir> -o <output-path>
```

### Options

| Flag | Description |
|------|-------------|
| `-t, --target <type>` | Output target: `docusaurus`, `mkdocs`, `generic`, `llm` |
| `-i, --input <dir>` | Path to the Doxygen XML output directory |
| `-o, --output <path>` | Output directory (CMS targets) or file path (`llm` target) |

### Examples

```bash
# Generate Docusaurus docs
dox2md -t docusaurus -i ./docs/xml -o ./docs/api

# Generate MkDocs docs
dox2md -t mkdocs -i ./docs/xml -o ./docs/api

# Generate a single LLM context file
dox2md -t llm -i ./docs/xml -o ./llms.txt
```

## Project Structure

```
src/
├── cli.ts               Commander.js entry point
├── generator.ts         Core logic (moxygen + Handlebars rendering)
└── templates/           Handlebars templates per target
    ├── docusaurus/
    │   ├── index.hbs    Index page template
    │   └── compound.hbs Per-compound page template (with YAML frontmatter)
    ├── mkdocs/
    │   ├── index.hbs
    │   └── compound.hbs
    ├── generic/
    │   ├── index.hbs
    │   └── compound.hbs
    └── llm/
        ├── index.hbs
        └── compound.hbs (minimalist, no frontmatter)
```

## Building from Source

```bash
npm install
npm run build
```
