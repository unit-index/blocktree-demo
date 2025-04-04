const express = require('express');
const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://blocktree.com");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Initialize with a Genesis block
let blocks = [
    { id: 0, location: 'Root', hash: 'genesis', timestamp: new Date().toISOString(), prevHash: '0' }
];
let earthBranch = [];
let marsBranch = [];
let splitOccurred = false;
const SPLIT_THRESHOLD = 3; // Split after 3 Root blocks

app.get('/chain', (req, res) => {
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch
    });
});

app.post('/chain/mine', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 1s mining delay
    const allBlocks = [...blocks, ...earthBranch, ...marsBranch];
    const newId = Math.max(...allBlocks.map(b => b.id)) + 1;

    let newBlock;
    if (!splitOccurred && blocks.length < SPLIT_THRESHOLD) {
        // Pre-split: Mine Root blocks
        const lastRoot = blocks[blocks.length - 1];
        newBlock = {
            id: newId,
            location: 'Root',
            hash: Math.random().toString(36).substring(2, 8),
            timestamp: new Date().toISOString(),
            prevHash: lastRoot.hash
        };
        blocks.push(newBlock);
        console.log(`Mined Root block: ${newId} (${newBlock.hash})`);
    } else if (!splitOccurred && blocks.length === SPLIT_THRESHOLD) {
        // At split: Create branches and mine the first branch block
        splitOccurred = true;
        const lastRoot = blocks[blocks.length - 1];
        earthBranch = [...blocks, { id: newId, location: 'Earth', hash: Math.random().toString(36).substring(2, 8), timestamp: new Date().toISOString(), prevHash: lastRoot.hash }];
        marsBranch = [...blocks];
        newBlock = earthBranch[earthBranch.length - 1]; // First Earth block
        console.log(`Split occurred! Mined first Earth block: ${newId} (${newBlock.hash})`);
    } else {
        // Post-split: Mine on Earth or Mars
        const branch = Math.random() > 0.5 ? 'Earth' : 'Mars';
        const targetBranch = branch === 'Earth' ? earthBranch : marsBranch;
        const lastBranchBlock = targetBranch[targetBranch.length - 1];
        newBlock = {
            id: newId,
            location: branch,
            hash: Math.random().toString(36).substring(2, 8),
            timestamp: new Date().toISOString(),
            prevHash: lastBranchBlock.hash
        };
        targetBranch.push(newBlock);
        console.log(`Mined ${branch} block: ${newId} (${newBlock.hash})`);
    }

    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch
    });
});

app.get('/debug', (req, res) => res.send('Server.js with /chain/mine - Deployed ' + new Date()));

// New reset endpoint
app.post('/chain/reset', (req, res) => {
    blocks = [
        { id: 0, location: 'Root', hash: 'genesis', timestamp: new Date().toISOString(), prevHash: '0' }
    ];
    earthBranch = [];
    marsBranch = [];
    splitOccurred = false;
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch
    });
});

app.listen(3001, () => console.log('Blocktree Demo on http://localhost:3001'));