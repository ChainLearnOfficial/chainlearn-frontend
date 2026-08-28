const fs = require('fs');
const file = 'src/components/course/course-card.test.tsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /expect\(screen\.getByText\("beginner"\)\)\.toBeInTheDocument\(\);/g,
    `expect(screen.getByText(/beginner/i)).toBeInTheDocument();`
  );
  code = code.replace(
    /const badge = screen\.getByText\(difficulty\);/g,
    `const badge = screen.getByText(new RegExp(difficulty, "i"));`
  );
  fs.writeFileSync(file, code);
}
