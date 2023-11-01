const fs = require('fs/promises');
const path = require('path');

const readTextFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return new Set(data.trim().split('\n'));
    } catch (err) {
        throw err;
    }
};

const getUniqueUsernames = async (directoryPath) => {
    const files = await fs.readdir(directoryPath);
    const usernameSets = await Promise.all(
        files.map((file) => readTextFile(path.join(directoryPath, file)))
    );
    const uniqueUsernames = new Set();
    for (const usernames of usernameSets) {
        usernames.forEach((username) => uniqueUsernames.add(username));
    }
    return uniqueUsernames;
};

const getCommonUsernames = async (directoryPath) => {
    const files = await fs.readdir(directoryPath);
    if (files.length === 0) {
        return new Set();
    }

    let commonUsernames = await readTextFile(path.join(directoryPath, files[0]));

    for (let i = 1; i < files.length; i++) {
        const filePath = path.join(directoryPath, files[i]);
        const usernames = await readTextFile(filePath);
        commonUsernames = new Set([...commonUsernames].filter((username) => usernames.has(username)));
    }

    return commonUsernames;
};

const getUsernameCounts = async (directoryPath) => {
    const usernameCounts = new Map();
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const usernames = await readTextFile(filePath);
        usernames.forEach((username) => {
            if (!usernameCounts.has(username)) {
                usernameCounts.set(username, 1);
            } else {
                usernameCounts.set(username, usernameCounts.get(username) + 1);
            }
        });
    }

    const usernamesInAtLeastTen = [...usernameCounts.keys()].filter(
        (username) => usernameCounts.get(username) >= 10
    );

    return usernamesInAtLeastTen.length;
};

const startSorting = (results, startTime) => {
    const endTime = process.hrtime(startTime);
    const elapsedTime = endTime[0] * 1000 + endTime[1] / 1e6;
    console.log('Unique usernames:', results[0].size);
    console.log('Usernames in all files:', results[1].size);
    console.log('Usernames in at least 10 files:', results[2]);
    console.log('Elapsed time:', Math.round(elapsedTime), 'ms');
};

const startTime = process.hrtime();

Promise.all([
    getUniqueUsernames('./dataset'),
    getCommonUsernames('./dataset'),
    getUsernameCounts('./dataset'),
])
    .then((results) => {
        startSorting(results, startTime);
    })
    .catch((err) => {
        console.error('Error:', err);
    });
