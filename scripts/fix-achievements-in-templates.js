const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'src', 'components', 'templates', 'resume-templates');
const filesToFix = [
  'AIEngineerTemplate.tsx',
  'DataAnalystTemplate.tsx',
  'ProductDesignerTemplate.tsx',
  'StartupResumeTemplate.tsx',
  'TechLeadTemplate.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(templatesDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace case 'achievements' section mainSectionTitleStyle with rightSectionTitleStyle
  if (content.includes('mainSectionTitleStyle') && content.includes("case 'achievements':")) {
    // Specifically target the style parameter inside case 'achievements':
    // Let's replace style={typeof mainSectionTitleStyle !== 'undefined' ? mainSectionTitleStyle : sidebarSectionTitleStyle}
    // with style={rightSectionTitleStyle}
    content = content.replace(
      "style={typeof mainSectionTitleStyle !== 'undefined' ? mainSectionTitleStyle : sidebarSectionTitleStyle}",
      "style={rightSectionTitleStyle}"
    );
    // Also check if there's any direct mainSectionTitleStyle left in case 'achievements':
    content = content.replace("style={mainSectionTitleStyle}", "style={rightSectionTitleStyle}");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully fixed achievements style variable in ${file}`);
  } else {
    console.log(`No fix needed or already fixed in ${file}`);
  }
});
