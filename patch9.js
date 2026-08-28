const fs = require('fs');
const files = ['src/tests/layout/mobile-nav.test.tsx', 'src/tests/layout/sidebar.test.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('useAuthStore')) {
    code = code.replace(
      /import \{ render, screen \} from "@testing-library\/react";/,
      `import { render, screen } from "@testing-library/react";\nimport { useAuthStore } from "@/store/auth-store";`
    );
  }
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
  fs.writeFileSync(file, code);
}
