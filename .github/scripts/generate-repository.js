#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get GitHub repository URL
function getGitHubRepoUrl() {
    try {
        const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
        
        // Convert SSH URL to HTTPS
        if (remoteUrl.startsWith('git@github.com:')) {
            return remoteUrl
                .replace('git@github.com:', 'https://github.com/')
                .replace(/\.git$/, '');
        }
        
        // Clean HTTPS URL
        return remoteUrl.replace(/\.git$/, '');
    } catch (error) {
        console.error('Error getting git remote URL:', error.message);
        // Fallback - try to get from environment (GitHub Actions)
        if (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY) {
            return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;
        }
        throw new Error('Could not determine GitHub repository URL');
    }
}

// Get GitHub Pages URL from repository URL
function getGitHubPagesUrl(repoUrl) {
    // Extract username and repo name from GitHub URL
    // Example: https://github.com/username/repo-name
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        throw new Error('Invalid GitHub repository URL');
    }
    
    const username = match[1];
    const repoName = match[2];
    
    // GitHub Pages URL format: https://username.github.io/repo-name
    return `https://${username}.github.io/${repoName}`;
}

// Extract value from exports statement
function extractExportValue(content, key) {
    const patterns = [
        new RegExp(`exports\\.${key}\\s*=\\s*['"\`]([^'"\`]+)['"\`]`, 'i'),
        new RegExp(`exports\\.${key}\\s*=\\s*['"]([^'"]+)['"]`, 'i'),
        new RegExp(`this\\.${key}\\s*=\\s*['"\`]([^'"\`]+)['"\`]`, 'i'),
        new RegExp(`this\\.${key}\\s*=\\s*['"]([^'"]+)['"]`, 'i')
    ];
    
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Parse component HTML file
function parseComponent(filePath, pagesUrl) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract script section
    const scriptMatch = content.match(/<script total>([\s\S]*?)<\/script>/i);
    const scriptContent = scriptMatch ? scriptMatch[1] : '';
    
    // Extract readme section
    const readmeMatch = content.match(/<readme>([\s\S]*?)<\/readme>/i);
    const readme = readmeMatch ? readmeMatch[1].trim() : '';
    
    // Extract component metadata
    const id = extractExportValue(scriptContent, 'id');
    const name = extractExportValue(scriptContent, 'name');
    const group = extractExportValue(scriptContent, 'group');
    const version = extractExportValue(scriptContent, 'version');
    const author = extractExportValue(scriptContent, 'author');
    const icon = extractExportValue(scriptContent, 'icon');
    const color = extractExportValue(scriptContent, 'color');
    const kind = extractExportValue(scriptContent, 'kind');
    
    // Generate URL - use GitHub Pages for proper headers
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const url = `${pagesUrl}/${relativePath}`;
    
    const component = {
        id: id || path.basename(filePath, '.html'),
        group: group || 'Uncategorized',
        name: name || path.basename(filePath, '.html'),
        url: url,
        author: author || '',
        icon: icon || '',
        color: color || '',
        version: version || '1',
        kind: kind || ''
    };
    
    // Add readme only if it exists and is not empty
    if (readme) component.readme = readme;
    
    return component;
}

// Recursively find all HTML files in directory (handles unlimited nesting depth)
function findComponentFiles(dir) {
    const files = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Recursively scan subdirectories at any depth
                scan(fullPath);
            } else if (stat.isFile() && item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    scan(dir);
    return files;
}

// Main function
function generateRepository() {
    console.log('Generating repository.json...');
    
    const componentsDir = path.join(process.cwd(), 'components');
    
    if (!fs.existsSync(componentsDir)) {
        console.error('Error: components directory not found');
        process.exit(1);
    }
    
    const repoUrl = getGitHubRepoUrl();
    const pagesUrl = getGitHubPagesUrl(repoUrl);
    console.log(`Repository URL: ${repoUrl}`);
    console.log(`GitHub Pages URL: ${pagesUrl}`);
    
    const componentFiles = findComponentFiles(componentsDir);
    console.log(`Found ${componentFiles.length} component files`);
    
    const components = componentFiles.map(file => {
        console.log(`Processing: ${path.relative(process.cwd(), file)}`);
        return parseComponent(file, pagesUrl);
    });
    
    // Sort components by group and name
    components.sort((a, b) => {
        if (a.group !== b.group) {
            return a.group.localeCompare(b.group);
        }
        return a.name.localeCompare(b.name);
    });
    
    const outputPath = path.join(process.cwd(), 'repository.json');
    fs.writeFileSync(outputPath, JSON.stringify(components, null, 2));
    
    console.log(`✓ Generated repository.json with ${components.length} components`);
}

// Run
try {
    generateRepository();
} catch (error) {
    console.error('Error generating repository:', error);
    process.exit(1);
}