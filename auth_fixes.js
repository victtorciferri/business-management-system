const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(process.cwd(), 'server/routes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix authentication checks
content = content.replace(/if \(!req\.isAuthenticated \|\| !req\.isAuthenticated\(\)\) \{/g, 
                          'if (!req.session?.user) {');

// Fix references to req.user
content = content.replace(/req\.user/g, 'req.session.user');

// Fix isAuthenticated function calls
content = content.replace(/req\.isAuthenticated\(\)/g, '!!req.session?.user');

// Write the changes back to the file
fs.writeFileSync(filePath, content);

console.log('Authentication fixes applied successfully');
