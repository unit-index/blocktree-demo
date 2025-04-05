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
let earth1Branch = [];
let venusBranch = [];
let mars1Branch = [];
let europaBranch = [];
let splitOccurred = false;
let earthSplitOccurred = false;
let marsSplitOccurred = false;
const SPLIT_THRESHOLD = 3;
const EARTH_SPLIT_THRESHOLD = 5;
const MARS_SPLIT_THRESHOLD = 7;

app.get('/chain', (req, res) => {
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch,
        earth1Branch: earth1Branch,
        venusBranch: venusBranch,
        mars1Branch: mars1Branch,
        europaBranch: europaBranch
    });
});

app.post('/chain/mine', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const allBlocks = [...blocks, ...earthBranch, ...marsBranch, ...earth1Branch, ...venusBranch, ...mars1Branch, ...europaBranch];
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
        // Root splits into Earth and Mars
        splitOccurred = true;
        const lastRoot = blocks[blocks.length - 1];
        earthBranch = [...blocks, { id: newId, location: 'Earth', hash: Math.random().toString(36).substring(2, 8), timestamp: new Date().toISOString(), prevHash: lastRoot.hash }];
        marsBranch = [...blocks];
        newBlock = earthBranch[earthBranch.length - 1];
        console.log(`Root split! Mined first Earth block: ${newId} (${newBlock.hash})`);
    } else if (splitOccurred && !earthSplitOccurred && earthBranch.filter(b => b.location === "Earth").length === EARTH_SPLIT_THRESHOLD) {
        // Earth splits into Earth1 and Venus
        earthSplitOccurred = true;
        const lastEarth = earthBranch[earthBranch.length - 1];
        earth1Branch = [...earthBranch, { id: newId, location: 'Earth1', hash: Math.random().toString(36).substring(2, 8), timestamp: new Date().toISOString(), prevHash: lastEarth.hash }];
        venusBranch = [...earthBranch];
        newBlock = earth1Branch[earth1Branch.length - 1];
        console.log(`Earth split! Mined first Earth1 block: ${newId} (${newBlock.hash})`);
    } else if (splitOccurred && !marsSplitOccurred && marsBranch.filter(b => b.location === "Mars").length === MARS_SPLIT_THRESHOLD) {
        // Mars splits into Mars1 and Europa
        marsSplitOccurred = true;
        const lastMars = marsBranch[marsBranch.length - 1];
        mars1Branch = [...marsBranch, { id: newId, location: 'Mars1', hash: Math.random().toString(36).substring(2, 8), timestamp: new Date().toISOString(), prevHash: lastMars.hash }];
        europaBranch = [...marsBranch];
        newBlock = mars1Branch[mars1Branch.length - 1];
        console.log(`Mars split! Mined first Mars1 block: ${newId} (${newBlock.hash})`);
    } else {
        // Post-split: Mine on Earth, Mars, Earth1, Venus, Mars1, or Europa
        const branchOptions = [
            !earthSplitOccurred ? 'Earth' : 'Earth1',
            !marsSplitOccurred ? 'Mars' : 'Mars1',
            earthSplitOccurred ? 'Venus' : null,
            marsSplitOccurred ? 'Europa' : null
        ].filter(Boolean);
        const branch = branchOptions[Math.floor(Math.random() * branchOptions.length)];
        const targetBranch = branch === 'Earth' ? earthBranch :
            branch === 'Mars' ? marsBranch :
                branch === 'Earth1' ? earth1Branch :
                    branch === 'Venus' ? venusBranch :
                        branch === 'Mars1' ? mars1Branch : europaBranch;
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
        marsBranch: marsBranch,
        earth1Branch: earth1Branch,
        venusBranch: venusBranch,
        mars1Branch: mars1Branch,
        europaBranch: europaBranch
    });
});

app.post('/chain/reset', (req, res) => {
    blocks = [
        { id: 0, location: 'Root', hash: 'genesis', timestamp: new Date().toISOString(), prevHash: '0' }
    ];
    earthBranch = [];
    marsBranch = [];
    earth1Branch = [];
    venusBranch = [];
    mars1Branch = [];
    europaBranch = [];
    splitOccurred = false;
    earthSplitOccurred = false;
    marsSplitOccurred = false;
    res.json({
        mainChain: blocks,
        earthBranch: earthBranch,
        marsBranch: marsBranch,
        earth1Branch: earth1Branch,
        venusBranch: venusBranch,
        mars1Branch: mars1Branch,
        europaBranch: europaBranch
    });
});

app.get('/debug', (req, res) => res.send('Server.js with /chain/mine - Deployed ' + new Date()));

app.listen(3001, () => console.log('Blocktree Demo on http://localhost:3001'));