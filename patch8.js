const fs = require('fs');
const file = 'src/components/layout/header.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /import \{ Avatar, AvatarFallback, AvatarImage \} from "@\/components\/ui\/avatar";\n/,
  ''
);
code = code.replace(
  /import \{ Avatar, AvatarFallback, getInitials \} from "@\/components\/ui\/avatar";\n/,
  'import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";\n'
);
fs.writeFileSync(file, code);
