#!/usr/bin/env node
import { Command } from 'commander';
import { generateDocs, type Target } from './generator.js';

const ALLOWED_TARGETS: Target[] = ['docusaurus', 'mkdocs', 'generic', 'llm'];

const program = new Command();

program
  .name('dox2md')
  .description('Multi-target documentation router: Doxygen XML → Markdown')
  .version('1.0.0')
  .requiredOption('-t, --target <type>', `Output target (${ALLOWED_TARGETS.join(', ')})`)
  .requiredOption('-i, --input <dir>', 'Path to the Doxygen XML directory')
  .requiredOption('-o, --output <path>', 'Output destination (directory for CMS targets, file for llm)')
  .action(async (options: { target: string; input: string; output: string }) => {
    const { target, input, output } = options;

    if (!ALLOWED_TARGETS.includes(target as Target)) {
      console.error(
        `Error: Invalid target "${target}". Allowed values: ${ALLOWED_TARGETS.join(', ')}`
      );
      process.exit(1);
    }

    try {
      await generateDocs(input, output, target as Target);
      console.log(`✓ Documentation generated successfully → ${output}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

program.parse();
