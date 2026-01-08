#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('📋 HARTKODIERTE STRINGS (müssen übersetzt werden):\n');

try {
  // Run ESLint and capture output
  const output = execSync('npm run lint 2>&1 | grep "disallow literal string:"', {
    encoding: 'utf8',
    cwd: process.cwd()
  });

  const lines = output.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    console.log('✅ Keine hartcodierten Strings gefunden!');
    process.exit(0);
  }

  // Process each line
  const processed = lines.map((line, index) => {
    // Extract file path and line number
    const fileMatch = line.match(/\/home\/fr4iser\/Documents\/Git\/EventPromoter\/frontend\/src\/(.+?\.jsx?)/);
    const lineMatch = line.match(/(\d+):\d+\s+error/);

    if (!fileMatch || !lineMatch) return null;

    const filePath = fileMatch[1];
    const lineNum = lineMatch[1];

    // Extract the string content
    const stringMatch = line.match(/disallow literal string: (.+?) i18next/);
    if (!stringMatch) return null;

    let stringContent = stringMatch[1].trim();

    // Clean up the string (remove extra whitespace, JSX tags if present)
    stringContent = stringContent.replace(/\s+/g, ' ').trim();

    return `${index + 1}. ${filePath}:${lineNum} - "${stringContent}"`;
  }).filter(Boolean);

  // Display results
  processed.forEach(line => console.log(line));

  console.log(`\n📊 Gesamt: ${processed.length} hartkodierte Strings gefunden`);
  console.log('\n💡 Diese müssen alle ins i18n-System übertragen werden!');

} catch (error) {
  console.error('❌ Fehler beim Ausführen von ESLint:', error.message);
  process.exit(1);
}
