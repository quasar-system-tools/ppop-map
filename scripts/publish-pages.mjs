import {execFileSync} from 'node:child_process';
const git = (...args) => execFileSync('git', args, {encoding:'utf8'}).trim();
if (git('status','--porcelain')) throw new Error('Commit changes before publishing Pages.');
// Only the public static directory is copied to the publishing branch.
const sha = git('subtree','split','--prefix=dist','HEAD');
execFileSync('git',['push','github',`${sha}:refs/heads/gh-pages`],{stdio:'inherit'});
console.log('Published static branch. Monitor Pages at https://quasar-system-tools.github.io/ppop-map/');
