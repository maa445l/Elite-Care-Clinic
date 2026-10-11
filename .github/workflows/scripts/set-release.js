// Runs in GitHub before the build: writes the version number and your repository name into package.json.
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = process.env.RELEASE_VERSION, owner = process.env.OWNER, repo = process.env.REPO;
if (!version || !owner || !repo) { console.error('Missing RELEASE_VERSION, OWNER or REPO'); process.exit(1); }
p.version = version;
p.build = p.build || {};
p.build.publish = { provider: 'github', owner: owner, repo: repo, releaseType: 'release' };
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
console.log('Set version ' + version + ' for ' + owner + '/' + repo);
