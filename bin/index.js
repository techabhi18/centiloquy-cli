#!/usr/bin/env node

import { program } from "commander";
import createCmd from "../lib/create.js";
import genCmd from "../lib/generate.js";

program.version("1.0.0");
program
  .command("create")
  .description("Create a new integration class")
  .action(createCmd);
program
  .command("generate <file>")
  .description("Generate getFieldParameter calls from spec")
  .action(genCmd);
program.parse(process.argv);
