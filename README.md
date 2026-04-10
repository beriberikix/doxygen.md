# doxygen.md

A central hub of reusable [Handlebars](https://handlebarsjs.com/) templates for the [`moxygen`](https://github.com/sourcey/moxygen) (v1.0.0+) CLI tool. Consume these templates in your C/C++ projects to standardize how Doxygen XML is converted into Markdown.

Two rendering targets are provided:

| Target | Output | Location |
|--------|--------|----------|
| **Docusaurus** | Individual `.mdx` files with YAML frontmatter, standard tables, sidebar-friendly anchors | `templates/docusaurus/` |
| **LLM (`llms.txt`)** | Single, ultra-dense `.md` file optimised for AI token efficiency — no HTML anchors, no frontmatter, lists instead of tables | `templates/llm/` |

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

#### Option A — npm / GitHub install (recommended)

Install directly from GitHub as an npm dev dependency — no registry account needed:

```bash
npm install --save-dev beriberikix/doxygen.md
```

This pins the templates to your `package-lock.json` and places them at
`./node_modules/doxygen.md/templates/`.  To target a specific release, append
the tag:

```bash
npm install --save-dev beriberikix/doxygen.md#v1.0.0
```

#### Option B — git submodule

```bash
git submodule add https://github.com/beriberikix/doxygen.md .doxygen-templates
```

#### Option C — manual copy

Copy the `templates/` directory into your project wherever you prefer.

### 2. Configure Doxygen

Ensure `GENERATE_XML = YES` and `XML_OUTPUT = doxygen/xml` in your `Doxyfile`.

```bash
doxygen Doxyfile
```

### 3. Add `package.json` scripts

Copy the relevant scripts into your project's `package.json`.

**If you used the npm / GitHub install (Option A):**

```jsonc
{
  "scripts": {
    // Generate per-file Docusaurus MDX pages
    "docs:api": "moxygen --templates ./node_modules/doxygen.md/templates/docusaurus --classes --groups --anchors --output ./website/docs/api/%s.md ./doxygen/xml",

    // Generate a single token-dense LLM context file
    "docs:llm": "moxygen --templates ./node_modules/doxygen.md/templates/llm --no-anchors --output ./public/llms.txt ./doxygen/xml"
  }
}
```

**If you used the git submodule (Option B):**

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

> **Tip:** If you copied `templates/` directly (Option C), replace the template path with wherever you placed it, e.g. `./doxygen-templates/`.

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
