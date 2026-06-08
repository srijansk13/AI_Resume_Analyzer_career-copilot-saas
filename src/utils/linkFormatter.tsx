import React from 'react';

/**
 * Normalizes a URL by ensuring it starts with http:// or https://
 */
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Extracts multiple URLs from a single string.
 */
export const extractUrls = (text: string): string[] => {
  if (!text) return [];
  // Basic regex to match URLs or domains (e.g. github.com/abc, https://live.com)
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map(m => normalizeUrl(m));
};

/**
 * Determines a professional label for a given URL based on context.
 */
export const getLinkLabel = (url: string, context: 'personal' | 'project' | 'publication' = 'personal'): string => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('linkedin.com')) {
    return 'LinkedIn';
  }
  if (lowerUrl.includes('github.com')) {
    return context === 'project' ? 'Code' : 'GitHub';
  }
  
  // Known hosting platforms -> Live (for projects) or Portfolio/Website (for personal)
  const isHostingPlatform = lowerUrl.includes('vercel.app') || 
                            lowerUrl.includes('netlify.app') || 
                            lowerUrl.includes('render.com') || 
                            lowerUrl.includes('railway.app') ||
                            lowerUrl.includes('heroku.com') ||
                            lowerUrl.includes('firebaseapp.com') ||
                            lowerUrl.includes('surge.sh') ||
                            lowerUrl.includes('github.io');

  if (context === 'project') {
    if (isHostingPlatform) return 'Live';
    // By default, a non-github project link is usually a live demo/site
    return 'Live'; 
  } else if (context === 'publication') {
    return 'Link';
  } else {
    // Personal context
    if (isHostingPlatform || lowerUrl.includes('portfolio') || lowerUrl.includes('me.') || lowerUrl.includes('.me')) {
      return 'Portfolio';
    }
    return 'Website';
  }
};

export interface FormattedLinksProps {
  text: string;
  context?: 'personal' | 'project' | 'publication';
  separator?: string | React.ReactNode;
  linkColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Parses a string containing one or more URLs and returns formatted clickable link labels.
 */
export const FormattedLinks: React.FC<FormattedLinksProps> = ({ 
  text, 
  context = 'personal', 
  separator = ' · ',
  linkColor = '#0f172a',
  style,
  className
}) => {
  if (!text) return null;
  
  // If the user already provided markdown or HTML, we should probably be careful, but we assume plain text containing URLs
  const urls = extractUrls(text);
  
  if (urls.length === 0) {
    return <span style={style} className={className}>{text}</span>;
  }

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', ...style }} className={className}>
      {urls.map((url, index) => (
        <React.Fragment key={`${url}-${index}`}>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: linkColor, 
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {getLinkLabel(url, context)}
          </a>
          {index < urls.length - 1 && (
            <span style={{ opacity: 0.7, margin: '0 2px' }}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

/**
 * Normalizes project links from multiple potential AI-generated field names into a single string.
 */
export const getNormalizedProjectLinks = (proj: any): string => {
  if (!proj) return '';
  const links = [
    proj.link, proj.liveUrl, proj.demoUrl, proj.projectUrl, 
    proj.githubUrl, proj.codeUrl, proj.sourceUrl, proj.repositoryUrl
  ];
  return links.filter(Boolean).join(' | ');
};

/**
 * A helper to render contact links explicitly, ensuring consistent styling
 * It takes individual contact fields and joins them nicely.
 */
export interface ContactLinksProps {
  contact?: any;
  linkedin?: string;
  github?: string;
  website?: string;
  separator?: string | React.ReactNode;
  linkColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const ContactLinks: React.FC<ContactLinksProps> = ({
  contact,
  linkedin,
  github,
  website,
  separator = ' · ',
  linkColor,
  style,
  className
}) => {
  const links = [];
  
  // Normalize fields from contact object if provided, falling back to explicit props
  const finalLinkedin = linkedin || contact?.linkedin || contact?.linkedinUrl;
  const finalGithub = github || contact?.github || contact?.githubUrl;
  const finalWebsite = website || contact?.website || contact?.websiteUrl || contact?.portfolio || contact?.portfolioUrl || contact?.personalWebsite;

  if (finalLinkedin) {
    const norm = normalizeUrl(finalLinkedin);
    links.push({ url: norm, label: 'LinkedIn' });
  }
  if (finalGithub) {
    const norm = normalizeUrl(finalGithub);
    links.push({ url: norm, label: 'GitHub' });
  }
  if (finalWebsite) {
    const norm = normalizeUrl(finalWebsite);
    links.push({ url: norm, label: getLinkLabel(norm, 'personal') });
  }
  
  if (links.length === 0) return null;

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', ...style }} className={className}>
      {links.map((link, index) => (
        <React.Fragment key={`contact-link-${index}`}>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: linkColor || '#0f172a', 
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {link.label}
          </a>
          {index < links.length - 1 && (
            <span style={{ opacity: 0.7, margin: '0 2px' }}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

export interface ProjectLinksProps {
  project: any;
  separator?: string | React.ReactNode;
  linkColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const ProjectLinks: React.FC<ProjectLinksProps> = ({
  project,
  separator = ' · ',
  linkColor,
  style,
  className
}) => {
  if (!project) return null;
  const links = [];

  const live = project.liveUrl || project.demoUrl || project.projectUrl || project.link;
  const code = project.githubUrl || project.codeUrl || project.sourceUrl || project.repositoryUrl;

  if (live) {
    const norm = normalizeUrl(live);
    links.push({ url: norm, label: 'Live' });
  }
  if (code) {
    const norm = normalizeUrl(code);
    links.push({ url: norm, label: 'Code' });
  }

  if (links.length === 0) return null;

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', ...style }} className={className}>
      {links.map((link, index) => (
        <React.Fragment key={`project-link-${index}`}>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: linkColor || '#0f172a', 
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {link.label}
          </a>
          {index < links.length - 1 && (
            <span style={{ opacity: 0.7, margin: '0 2px' }}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};
