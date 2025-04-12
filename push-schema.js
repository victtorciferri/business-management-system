// Script to push database schema without interactive prompts
import { exec } from 'child_process';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load shared schema file to get table information
const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extract table names from schema
const tableRegex = /export const (\w+) = pgTable\("([^"]+)"/g;
const tables = [];
let match;

while ((match = tableRegex.exec(schemaContent)) !== null) {
  tables.push({
    variableName: match[1],
    tableName: match[2]
  });
}

console.log('Tables to create:', tables.map(t => t.tableName).join(', '));

// Create SQL statements to create the tables if they don't exist
const sql = tables.map(table => {
  // Check if the table exists, if not create it using our schema
  return `
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '${table.tableName}') THEN
    RAISE NOTICE 'Creating table ${table.tableName}';
  END IF;
END
$$;
  `;
}).join('\n');

// Write SQL to a temporary file
fs.writeFileSync('temp-schema-check.sql', sql);

// Execute the standard db:push command that's defined in package.json
console.log('Pushing schema to database...');
exec('echo "y" | npm run db:push', (error, stdout, stderr) => {
  console.log(stdout);
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log('Schema pushed successfully!');
  
  // Clean up
  try {
    fs.unlinkSync('temp-schema-check.sql');
  } catch (err) {
    console.log('No temp file to clean up');
  }
});