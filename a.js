function makeBranchName() {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 15);
    return `feature/${date}-${random}`;
}

console.log(makeBranchName())
