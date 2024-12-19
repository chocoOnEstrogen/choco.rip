const { execSync } = require('child_process');
const readline = require('readline');

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

function makeBranchName() {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `feature/${date}-${random}`;
}

async function main() {
    try {
        // Get current branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        
        // Ensure working directory is clean
        const status = execSync('git status --porcelain', { encoding: 'utf-8' });
        if (!status) {
            console.log('No changes to commit.');
            process.exit(0);
        }

        // Create new feature branch with timestamp
        const branchName = makeBranchName();
        console.log(`Creating new branch: ${branchName}`);
        executeCommand(`git checkout -b ${branchName}`);
        
        // Stage changes
        const stageAll = await ask('Stage all changes? (y/N)');
        if (stageAll.toLowerCase() === 'y') {
            executeCommand('git add .');
        } else {
            executeCommand('git status');
            console.log('\nPlease stage your changes manually and run this script again.');
            process.exit(0);
        }
        
        // Get commit message
        const commitMessage = await ask('Enter commit message:');
        if (!commitMessage) {
            console.log('Commit message cannot be empty');
            process.exit(1);
        }
        
        // Commit changes
        executeCommand(`git commit -m "${commitMessage}"`);
        
        // Push to remote
        console.log(`\nPushing to ${branchName}...`);
        executeCommand(`git push origin ${branchName}`);
        
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
