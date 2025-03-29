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

let blocks = [
    { id: 1, location: 'Root', hash: 'abc123' },
    { id: 2, location: 'Root', hash: 'def456' },
    { id: 3, location: 'Root', hash: 'ghi789' }
];
let earthBranch = [];
let marsBranch = [];
let splitOccurred = false;

app.get('/chain', (req, res) => {
    if (blocks.length >= 3 && !splitOccurred) {
        splitOccurred = true;
        earthBranch = [...blocks, { id: 4, location: 'Earth', hash: 'jkl012' }];
        marsBranch = [...blocks, { id: 4, location: 'Mars', hash: 'mno345' }];
        console.log('Chain split occurred!');
    }
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch
    });
});

app.post('/chain/mine', (req, res) => {
    if (!splitOccurred) {
        return res.status(400).json({ error: 'Chain split has not occurred yet. Fetch /chain first.' });
    }
    const allBlocks = [...blocks, ...earthBranch, ...marsBranch];
    const newId = Math.max(...allBlocks.map(b => b.id)) + 1;
    const branch = Math.random() > 0.5 ? 'Earth' : 'Mars';
    const newBlock = {
        id: newId,
        location: branch,
        hash: Math.random().toString(36).substring(2, 8)
    };
    if (branch === 'Earth') {
        earthBranch.push(newBlock);
    } else {
        marsBranch.push(newBlock);
    }
    console.log(`Mined new block: ${branch} ${newId} (${newBlock.hash})`);
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch
    });
});

app.get('/debug', (req, res) => res.send('Server.js with /chain/mine - Deployed ' + new Date()));

app.listen(3001, () => console.log('Blocktree Demo on http://localhost:3001'));