const { execSync } = require('child_process');
const readline = require('readline');

const COMMIT_TYPES = {
    feat: 'A new feature',
    fix: 'A bug fix',
    style: 'Changes that do not affect the meaning of the code',
    refactor: 'A code change that neither fixes a bug nor adds a feature',
    perf: 'A code change that improves performance',
    test: 'Adding missing tests or correcting existing tests',
    workflow: 'Changes to workflows or build processes',
    ci: 'Changes to CI configuration files and scripts',
    chore: 'Other changes that don\'t modify src or test files',
    types: 'Type definition changes',
    wip: 'Work in progress'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function executeCommand(command) {
    try {
        return execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

function ask(question) {
    return new Promise((resolve) => {
        rl.question(`> ${question} `, (answer) => resolve(answer.trim()));
    });
}

async function getCommitType() {
    console.log('\nAvailable commit types:');
    Object.entries(COMMIT_TYPES).forEach(([type, desc]) => {
        console.log(`  ${type.padEnd(8)} - ${desc}`);
    });
    
    let type;
    do {
        type = await ask('Select commit type:');
    } while (!COMMIT_TYPES[type]);
    
    return type;
}

async function getCommitScope() {
    const scope = await ask('Enter commit scope (optional):');
    return scope ? `(${scope})` : '';
}

async function getBreakingChanges() {
    const hasBreaking = await ask('Are there breaking changes? (y/N):');
    if (hasBreaking.toLowerCase() === 'y') {
        const description = await ask('Describe the breaking changes:');
        return `\n\nBREAKING CHANGE: ${description}`;
    }
    return '';
}

async function getIssueReferences() {
    const hasIssues = await ask('Are there related issues? (y/N):');
    if (hasIssues.toLowerCase() === 'y') {
        const issues = await ask('Enter issue numbers (comma-separated):');
        return '\n\n' + issues.split(',')
            .map(issue => issue.trim())
            .filter(issue => issue)
            .map(issue => `Closes #${issue}`)
            .join('\n');
    }
    return '';
}

async function createBranch() {
    const branchType = await ask('Select branch type (feature/hotfix/release):');
    const rnd = Math.random().toString(36).substring(2, 8);
    const date = new Date().toISOString().split('T')[0];
    return `${branchType}/${date}-${rnd}`;
}

async function main() {
    try {
        // Get current branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        
        // Ensure working directory has changes
        const status = execSync('git status --porcelain', { encoding: 'utf-8' });
        if (!status) {
            console.log('No changes to commit.');
            process.exit(0);
        }

        // Create new branch if needed
        const createNewBranch = await ask('Create new branch? (y/N):');
        const branchName = createNewBranch.toLowerCase() === 'y' 
            ? await createBranch()
            : currentBranch;

        if (createNewBranch.toLowerCase() === 'y') {
            executeCommand(`git checkout -b ${branchName}`);
        }
        
        // Stage changes
        const stageAll = await ask('Stage all changes? (y/N):');
        if (stageAll.toLowerCase() === 'y') {
            executeCommand('git add .');
        } else {
            executeCommand('git status');
            const proceed = await ask('Stage files manually and continue? (y/N):');
            if (proceed.toLowerCase() !== 'y') {
                process.exit(0);
            }
        }
        
        // Build commit message
        const type = await getCommitType();
        const scope = await getCommitScope();
        const subject = await ask('Enter commit subject:');
        const body = await ask('Enter commit body (optional):');
        const breakingChanges = await getBreakingChanges();
        const issueRefs = await getIssueReferences();
        
        // Construct final commit message
        let commitMessage = `${type}${scope}: ${subject}`;
        if (body) commitMessage += `\n\n${body}`;
        commitMessage += breakingChanges;
        commitMessage += issueRefs;
        
        // Commit changes
        executeCommand(`git commit -m "${commitMessage}"`);
        
        // Push to remote
        const pushNow = await ask('Push to remote? (y/N):');
        if (pushNow.toLowerCase() === 'y') {
            executeCommand(`git push origin ${branchName}`);
        }

        // Switch back to original branch
        console.log(`\nSwitching back to ${currentBranch}...`);
        executeCommand(`git checkout ${currentBranch}`);

        // Delete local feature branch
        console.log(`\nDeleting local branch ${branchName}...`);
        executeCommand(`git branch -D ${branchName}`);
        
        console.log('\nDone! 🎉');
        rl.close();
    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

main();
