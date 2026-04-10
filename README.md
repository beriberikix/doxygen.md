# doxygen.md

A central hub of reusable [Handlebars](https://handlebarsjs.com/) templates for the [`moxygen`](https://github.com/sourcey/moxygen) (v1.0.0+) CLI tool. Consume these templates in your C/C++ projects to standardize how Doxygen XML is converted into Markdown.

Two rendering targets are provided:

| Target | Output | Location |
|--------|--------|----------|
| **Docusaurus** | Individual `.mdx` files with YAML frontmatter, standard tables, sidebar-friendly anchors | `templates/docusaurus/` |
| **LLM (`llms.txt`)** | Single, ultra-dense `.md` file optimised for AI token efficiency — no HTML anchors, no frontmatter, lists instead of tables | `templates/llm/` |

---

## GitHub Action

The easiest way to use these templates is via the published GitHub Action. Add a step to any workflow after Doxygen has already run:

```yaml
- name: Generate API docs (Docusaurus)
  uses: beriberikix/doxygen.md@main
  with:
    target: docusaurus          # 'docusaurus' (default) or 'llm'
    xml_path: doxygen/xml       # path to Doxygen XML output (default: doxygen/xml)
    output: website/docs/api/%s.md  # omit to use the per-target default
    classes: "true"             # pass --classes (docusaurus only, default: true)
    groups: "true"              # pass --groups  (docusaurus only, default: true)
    # moxygen_version: "1.0.0"  # pin a specific moxygen version (default: latest)
```

```yaml
- name: Generate LLM context file
  uses: beriberikix/doxygen.md@main
  with:
    target: llm
    xml_path: doxygen/xml
    output: public/llms.txt
```

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `target` | no | `docusaurus` | Rendering target: `docusaurus` or `llm` |
| `xml_path` | no | `doxygen/xml` | Path to Doxygen XML output directory |
| `output` | no | *(target default)* | Output path pattern for `--output`. Docusaurus default: `./website/docs/api/%s.md`; LLM default: `./public/llms.txt` |
| `classes` | no | `true` | Pass `--classes` to moxygen (docusaurus only) |
| `groups` | no | `true` | Pass `--groups` to moxygen (docusaurus only) |
| `moxygen_version` | no | `latest` | moxygen npm version to install |

### Outputs

| Output | Description |
|--------|-------------|
| `output_path` | The resolved output path that was passed to moxygen |

### Full workflow example

```yaml
name: Docs

on:
  push:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Doxygen
        uses: mattnotmitt/doxygen-action@v1
        with:
          doxyfile-path: Doxyfile

      - name: Generate Docusaurus MDX
        uses: beriberikix/doxygen.md@main
        with:
          target: docusaurus
          xml_path: doxygen/xml

      - name: Generate llms.txt
        uses: beriberikix/doxygen.md@main
        with:
          target: llm
          xml_path: doxygen/xml
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Doxygen](https://www.doxygen.nl/) | ≥ 1.9 | Parses C/C++ source and emits XML |
| [moxygen](https://github.com/sourcey/moxygen) | ≥ 1.0.0 | Converts Doxygen XML → Markdown via Handlebars |
| [Node.js](https://nodejs.org/) | ≥ 18 | Runtime for moxygen |

Install moxygen globally or as a dev dependency:

```bash
npm install -g moxygen
# or
npm install --save-dev moxygen
```

---

## Repository Structure

```
/
├── README.md
└── templates/
    ├── docusaurus/
    │   ├── index.hbs     # API index page (lists all compounds)
    │   ├── compound.hbs  # One page per class / struct / namespace / group
    │   └── member.hbs    # Partial: single function / variable / enum entry
    └── llm/
        ├── index.hbs
        ├── compound.hbs
        └── member.hbs
```

---

## Usage

### 1. Reference this repository

Add this repo as a **git submodule** or copy the `templates/` directory into your project:

```bash
# As a submodule (recommended)
git submodule add https://github.com/beriberikix/doxygen.md .doxygen-templates
```

### 2. Configure Doxygen

Ensure `GENERATE_XML = YES` and `XML_OUTPUT = doxygen/xml` in your `Doxyfile`.

```bash
doxygen Doxyfile
```

### 3. Add `package.json` scripts

Copy the relevant scripts into your project's `package.json`:

```jsonc
{
  "scripts": {
    // Generate per-file Docusaurus MDX pages
    "docs:api": "moxygen --templates ./.doxygen-templates/templates/docusaurus --classes --groups --anchors --output ./website/docs/api/%s.md ./doxygen/xml",

    // Generate a single token-dense LLM context file
    "docs:llm": "moxygen --templates ./.doxygen-templates/templates/llm --no-anchors --output ./public/llms.txt ./doxygen/xml"
  }
}
```

> **Tip:** If you copied `templates/` directly, replace `./.doxygen-templates/templates/` with the path where you placed it, e.g. `./doxygen-templates/`.

### 4. Run

```bash
# Docusaurus output
npm run docs:api

# LLM output
npm run docs:llm
```

---

## Template Variables Reference

`moxygen` exposes the following Handlebars variables (derived from Doxygen XML):

### Compound context (`compound.hbs`)

| Variable | Type | Description |
|----------|------|-------------|
| `{{refid}}` | string | Unique Doxygen reference ID |
| `{{name}}` | string | Compound name (class, struct, …) |
| `{{briefdescription}}` | string | One-line description |
| `{{detaileddescription}}` | string | Full description (Markdown) |
| `{{#each sectiondef}}` | array | Sections (public-func, public-attrib, …) |
| `{{title}}` | string | Section display title |
| `{{#each memberdef}}` | array | Members within the section |

### Member partial context (`member.hbs`)

| Variable | Type | Description |
|----------|------|-------------|
| `{{name}}` | string | Member name |
| `{{refid}}` | string | Unique reference ID |
| `{{kind}}` | string | `function`, `variable`, `enum`, … |
| `{{type}}` | string | Return / variable type |
| `{{definition}}` | string | Full declaration |
| `{{argsstring}}` | string | Argument list string |
| `{{briefdescription}}` | string | One-line description |
| `{{detaileddescription}}` | string | Full description |
| `{{returns}}` | string | Return value description |
| `{{#each param}}` | array | Parameter list |
| `{{declname}}` | string | Parameter name (inside `param`) |
| `{{description}}` | string | Parameter description (inside `param`) |

### Index context (`index.hbs`)

| Variable | Type | Description |
|----------|------|-------------|
| `{{#each compounds}}` | array | All documented compounds |
| `{{name}}` | string | Compound name |
| `{{refid}}` | string | Used to build links |
| `{{briefdescription}}` | string | One-line description |

---

## llms.txt Compliance

The LLM templates follow the [llmstxt.org](https://llmstxt.org/) recommendations:

- No YAML frontmatter
- No HTML tags or anchor elements
- Flat hierarchy — parameters as lists, not tables
- Minimal decorative punctuation

---

## License

[MIT](LICENSE)
