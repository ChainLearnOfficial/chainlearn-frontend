const fs = require('fs');
const files = [
  'src/components/layout/mobile-nav.test.tsx',
  'src/components/layout/sidebar.test.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('vi.mock("next/navigation"')) {
    code = code.replace(
      /import \{ render, screen \} from "@testing-library\/react";/,
      `import { render, screen } from "@testing-library/react";\nimport { vi } from "vitest";\n\nvi.mock("next/navigation", () => ({\n  usePathname: () => "/dashboard",\n  useRouter: () => ({ push: vi.fn() }),\n  useSearchParams: () => new URLSearchParams(),\n}));`
    );
  }
  fs.writeFileSync(file, code);
}
