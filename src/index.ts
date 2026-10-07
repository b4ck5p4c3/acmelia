#!/usr/bin/env bun
import { genkey } from '@/cli/genkey'

import { serve } from './serve'

const [command, configPath] = process.argv.slice(2)

switch (command) {
  case 'genkey': {
    await genkey()
    break
  }

  case 'serve': {
    serve(configPath)
    break
  }

  default: {
    console.error('Usage: acmelia serve [config-file] | acmelia genkey')
    process.exit(1)
  }
}
