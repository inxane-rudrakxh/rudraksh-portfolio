const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://rudrakshkottalwar.is-a.dev';
const AUTHOR = 'Rudraksh Kottalwar';

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file === 'node_modules' || file === '.git' || file === 'js' || file === 'images') continue;
        
        if (fs.statSync(fullPath).isDirectory()) {
            processHtmlFiles(fullPath);
        } else if (fullPath.endsWith('.html')) {
            processFile(fullPath);
            console.log(`Processed: ${fullPath}`);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Determine the route path for the canonical URL
    const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    let routePath = relativePath.replace(/index\.html$/, '').replace(/\.html$/, '');
    if (routePath.endsWith('/')) {
        routePath = routePath.slice(0, -1);
    }
    const url = `${DOMAIN}${routePath ? '/' + routePath : ''}`;
    
    // Extract title and description
    let titleMatch = content.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1] : 'Rudraksh Kottalwar - Software Developer';
    title = title.replace(' - Majd', '').replace(' - Rudraksh', ' - Rudraksh'); 
    
    let descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    let description = descMatch ? descMatch[1] : 'Computer Science student and software developer passionate about building modern web experiences, Android applications, AI-powered tools, and intuitive user interfaces.';
    
    // Fix relative image URLs in og:image and twitter:image
    content = content.replace(/content="(?:https:\/\/rudrakshkottalwar\.is-a\.dev\/)?(?:\.\.\/)*images\/([^"]+)"/g, (match, imgPath) => {
        return `content="${DOMAIN}/images/${imgPath}"`;
    });
    
    // Ensure standard meta tags
    const missingMetas = [];
    if (!content.includes('name="keywords"')) missingMetas.push('<meta name="keywords" content="Rudraksh Kottalwar, Software Developer, Android Developer, Full Stack, Portfolio, Developer India">');
    if (!content.includes('name="author"')) missingMetas.push(`<meta name="author" content="${AUTHOR}">`);
    if (!content.includes('name="theme-color"')) missingMetas.push('<meta name="theme-color" content="#faf7f3">');
    if (!content.includes('name="viewport"')) missingMetas.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    
    // Remove any existing canonical
    // Since we already injected it, we need to clean up old ones and our previously injected ones to not duplicate
    content = content.replace(/<!-- INJECTED SEO TAGS START -->[\s\S]*?<!-- INJECTED SEO TAGS END -->\s*/g, '');
    content = content.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi, '');
    
    let type = 'website';
    if (routePath.startsWith('blog/') && routePath !== 'blog') {
        type = 'article';
    } else if (routePath.startsWith('work/') && routePath !== 'work') {
        type = 'article'; 
    }
    
    const canonicalTag = `<link rel="canonical" href="${url}" />`;
    
    // Open Graph
    const ogTags = [];
    if (!content.includes('property="og:url"')) ogTags.push(`<meta property="og:url" content="${url}">`);
    if (!content.includes('property="og:type"')) ogTags.push(`<meta property="og:type" content="${type}">`);
    if (!content.includes('property="og:site_name"')) ogTags.push(`<meta property="og:site_name" content="${AUTHOR}">`);
    
    // Structured Data
    let schema = {};
    if (routePath === '') {
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "@id": `${DOMAIN}/#website`,
                    "url": DOMAIN,
                    "name": AUTHOR,
                    "description": description
                },
                {
                    "@type": "Person",
                    "@id": `${DOMAIN}/#person`,
                    "name": AUTHOR,
                    "url": DOMAIN,
                    "jobTitle": "Software Developer",
                    "sameAs": [
                        "https://github.com/inxane-rudrakxh"
                    ]
                },
                {
                    "@type": "ProfilePage",
                    "@id": `${DOMAIN}/#webpage`,
                    "url": DOMAIN,
                    "inLanguage": "en-US",
                    "isPartOf": { "@id": `${DOMAIN}/#website` },
                    "about": { "@id": `${DOMAIN}/#person` }
                }
            ]
        };
    } else if (routePath.startsWith('blog/') && routePath !== 'blog') {
        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "author": {
                "@type": "Person",
                "name": AUTHOR,
                "url": DOMAIN
            }
        };
    } else if (routePath.startsWith('work/') && routePath !== 'work') {
        schema = {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": title,
            "description": description,
            "author": {
                "@type": "Person",
                "name": AUTHOR,
                "url": DOMAIN
            }
        };
    }
    
    const schemaScript = Object.keys(schema).length > 0 ? `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` : '';
    
    // Performance tags
    const perfTags = `
    <link rel="preconnect" href="https://events.framer.com" crossorigin>
    <link rel="dns-prefetch" href="https://events.framer.com">
    `;
    
    const injection = `
    <!-- INJECTED SEO TAGS START -->
    ${canonicalTag}
    ${missingMetas.join('\n    ')}
    ${ogTags.join('\n    ')}
    ${schemaScript}
    ${perfTags}
    <!-- INJECTED SEO TAGS END -->
    `;
    
    content = content.replace('</head>', `${injection}\n</head>`);
    
    // Add alt tags to images that don't have them
    content = content.replace(/<img((?:(?!\balt=)[^>])+?)>/gi, (match, p1) => {
        if (p1.toLowerCase().includes('alt=')) return match;
        return `<img alt="${title.replace(/"/g, '&quot;')} image" ${p1.trim()}>`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
}

processHtmlFiles(__dirname);
console.log('Done!');
