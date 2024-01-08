/* eslint-disable */
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isDryRun = !args.includes('--publish');

const buildCommand = 'cd src/ambient-utils && yarn build';
const publishCommand = `cd src/ambient-utils && yarn publish${
    isDryRun ? ' --dry-run' : ''
} --access public`;

try {
    console.log('Building utils package...');
    execSync(buildCommand, { stdio: 'inherit' });

    if (isDryRun) {
        console.log('Performing a dry run of the publish process...');
    } else {
        console.log('Publishing utils package to npm...');
    }

    execSync(publishCommand, { stdio: 'inherit' });

    console.log('Done!');
} catch (error) {
    console.error('Error occurred:', error);
}
