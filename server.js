const express = require('express');
const app = express();
app.use(express.json());

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

app.listen(3001, () => console.log('Blocktree Demo on http://localhost:3001'));