const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'src', 'components', 'templates', 'resume-templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

console.log(`Found ${files.length} templates.`);

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if case 'achievements': is already implemented (in case we didn't reset, but we will run git checkout first)
  if (content.includes("case 'achievements':") || content.includes('case "achievements":')) {
    console.log(`Achievements already present in ${file}, skipping`);
    return;
  }

  // Determine standard style of the file
  let achievementsBlock = '';

  if (content.includes('sectionHeaderStyle') && content.includes('sectionAccentLine')) {
    // Creative, Clean Professional, startup, corporate, academic styles
    achievementsBlock = `
            case 'achievements':
              const achsCreative = content.achievements || [];
              return visibleSections.achievements !== false && achsCreative.length > 0 ? (
                <section key="achievements">
                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievements & Awards</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {achsCreative.map((ach) => (
                      <div key={ach.id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '9.5pt', color: '#0f172a' }}>{ach.title}</span>
                          {ach.description && <span style={{ fontSize: '9pt', color: '#475569', marginLeft: '6px' }}>— {ach.description}</span>}
                        </div>
                        {ach.date && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b', fontWeight: 500 }}>{ach.date}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
`;
  } else if (content.includes('mainSectionTitleStyle') || content.includes('sidebarSectionTitleStyle') || content.includes('rightSectionTitleStyle')) {
    // Modern Developer, Elegant Sidebar, AI Engineer, Data Analyst, Product Designer, Product Manager styles
    let titleStyle = 'sidebarSectionTitleStyle';
    if (content.includes('rightSectionTitleStyle')) {
      titleStyle = 'rightSectionTitleStyle';
    } else if (content.includes('mainSectionTitleStyle')) {
      titleStyle = 'mainSectionTitleStyle';
    }

    achievementsBlock = `
      case 'achievements':
        const achsDeveloper = content.achievements || [];
        return visibleSections.achievements !== false && achsDeveloper.length > 0 ? (
          <section key="achievements">
            <h3 style={${titleStyle}}>Achievements & Awards</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {achsDeveloper.map((ach) => (
                <div key={ach.id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '9pt' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{ach.title}</span>
                    {ach.description && <span style={{ color: '#475569', marginLeft: '6px' }}>— {ach.description}</span>}
                  </div>
                  {ach.date && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b' }}>{ach.date}</span>}
                </div>
              ))}
            </div>
          </section>
        ) : null;
`;
  } else if (content.includes('border-black') || content.includes('className=')) {
    // ATS Classic style (Tailwind)
    achievementsBlock = `
            case 'achievements':
              const achsATS = content.achievements || [];
              return visibleSections.achievements !== false && achsATS.length > 0 ? (
                <section key="achievements">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2 pb-0.5">
                    Achievements & Awards
                  </h2>
                  <div className="space-y-1.5 text-[10pt]">
                    {achsATS.map((ach) => (
                      <div key={ach.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-gray-900">{ach.title}</span>
                          {ach.description && <span className="text-gray-700 ml-1">— {ach.description}</span>}
                        </div>
                        {ach.date && <span className="text-sm text-gray-800 font-semibold font-sans">{ach.date}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
`;
  } else {
    // Generic fallback styles
    achievementsBlock = `
            case 'achievements':
              const achsGeneric = content.achievements || [];
              return visibleSections.achievements !== false && achsGeneric.length > 0 ? (
                <section key="achievements" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Achievements & Awards</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {achsGeneric.map((ach) => (
                      <div key={ach.id} style={{ display: 'flex', justifyContent: 'between' }}>
                        <div>
                          <strong>{ach.title}</strong>
                          {ach.description && <span> — {ach.description}</span>}
                        </div>
                        {ach.date && <span>{ach.date}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;
`;
  }

  // Find index of case 'certifications': and insert achievementsBlock right after the case certifications return block
  const searchPattern = "case 'certifications':";
  const index = content.indexOf(searchPattern);

  if (index === -1) {
    console.log(`Could not find case 'certifications': in ${file}`);
    return;
  }

  const rest = content.substring(index);
  const nextCaseIndex = rest.indexOf("case '", 10);
  const nextDefaultIndex = rest.indexOf("default:", 10);
  
  let insertPos = -1;
  if (nextCaseIndex !== -1) {
    insertPos = index + nextCaseIndex;
  } else if (nextDefaultIndex !== -1) {
    insertPos = index + nextDefaultIndex;
  }

  if (insertPos === -1) {
    console.log(`Could not determine insert position for ${file}`);
    return;
  }

  const before = content.substring(0, insertPos);
  const after = content.substring(insertPos);
  content = before + achievementsBlock + '\n' + after;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully added achievements case to ${file}`);
});
