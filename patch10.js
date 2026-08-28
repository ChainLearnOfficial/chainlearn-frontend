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
  if (!code.includes('useAuthStore')) {
    code = code.replace(
      /import \{ render, screen \} from "@testing-library\/react";/,
      `import { render, screen } from "@testing-library/react";\nimport { useAuthStore } from "@/store/auth-store";`
    );
  }
  if (!code.includes('useAuthStore.setState')) {
    if (!code.includes('beforeEach')) {
      code = code.replace(
        /describe\(".*", \(\) => \{/,
        `describe("Nav", () => {\n  beforeEach(() => {\n    useAuthStore.setState({ isAuthenticated: true, hasHydrated: true });\n  });\n`
      );
    } else {
      code = code.replace(
        /beforeEach\(\(\) => \{/,
        `beforeEach(() => {\n    useAuthStore.setState({ isAuthenticated: true, hasHydrated: true });`
      );
    }
  }
  fs.writeFileSync(file, code);
}

const headerFiles = [
  'src/components/layout/header.test.tsx',
  'src/tests/layout/header.test.tsx'
];

for (const file of headerFiles) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/getByLabelText\("Toggle navigation"\)/g, 'getByLabelText(/Toggle navigation/i)');
  fs.writeFileSync(file, code);
}
