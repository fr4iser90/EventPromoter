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
    // Extract line number and string content from ESLint output
    const lineMatch = line.match(/^\s*(\d+):\d+\s+error\s+disallow literal string:\s*(.+?)\s*i18next/);

    if (!lineMatch) return null;

    const lineNum = lineMatch[1];
    let stringContent = lineMatch[2].trim();

    // Skip already translated strings (those containing t('...'))
    if (stringContent.includes("t('") || stringContent.includes('i18n.t')) {
      return null;
    }

    // Clean up the string (remove extra whitespace)
    stringContent = stringContent.replace(/\s+/g, ' ').trim();

    // For now, we'll show line numbers without full file paths since ESLint output doesn't include full paths in this format
    return `${index + 1}. Line ${lineNum} - "${stringContent}"`;
  }).filter(Boolean);

  // Display results
  processed.forEach(line => console.log(line));

  console.log(`\n📊 Gesamt: ${processed.length} hartkodierte Strings gefunden`);
  console.log('\n💡 Diese müssen alle ins i18n-System übertragen werden!');

} catch (error) {
  console.error('❌ Fehler beim Ausführen von ESLint:', error.message);
  process.exit(1);
}
