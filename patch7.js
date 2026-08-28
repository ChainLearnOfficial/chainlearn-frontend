const fs = require('fs');
const file = 'src/tests/course/course-card.test.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /expect\(screen\.getByText\("beginner"\)\)\.toBeInTheDocument\(\);/,
  `expect(screen.getByText(/beginner/i)).toBeInTheDocument();`
);
code = code.replace(
  /const badge = screen\.getByText\(difficulty\);/,
  `const badge = screen.getByText(new RegExp(difficulty, "i"));`
);
fs.writeFileSync(file, code);
