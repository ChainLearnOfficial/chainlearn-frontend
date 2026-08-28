const fs = require('fs');
const files = [
  'src/components/layout/mobile-nav.test.tsx',
  'src/components/layout/sidebar.test.tsx',
  'src/tests/layout/mobile-nav.test.tsx',
  'src/tests/layout/sidebar.test.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('beforeEach') && !code.includes('beforeEach } from "vitest"')) {
    code = code.replace(
      /import \{ describe, it, expect \} from "vitest";/,
      `import { describe, it, expect, beforeEach } from "vitest";`
    );
    // if vi is imported separately, wait, it might be `describe, it, expect, vi`
    code = code.replace(
      /import \{ describe, it, expect, vi \} from "vitest";/,
      `import { describe, it, expect, vi, beforeEach } from "vitest";`
    );
  }
  fs.writeFileSync(file, code);
}
