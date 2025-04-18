/**
 * Script to push the schema to the database
 * This is useful when making changes to the schema and want to quickly push them to the database
 */

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Run drizzle-kit push command
console.log('Pushing schema to database...');
exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing drizzle-kit push: ${error}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Drizzle-kit push stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('Schema pushed successfully!');
});