const fs = require('fs');
const rawData = require('./data.json');

const transformDataToUserMap = (data, dataKey) => {
    const userMap = {};

    data.forEach((entry) => {
        const userId = entry.user._id;
        const userName = entry.user.name;
        const dataInfo = {
            startDate: entry.startDate,
            endDate: entry.endDate,
        };

        if (!userMap[userId]) {
            userMap[userId] = {
                userId,
                userName,
                [dataKey]: [dataInfo],
            };
        } else {
            userMap[userId][dataKey].push(dataInfo);
        }
    });
    return userMap;
};

const writeTransformedDataToFile = (data, dataKey) => {
    const userData = transformDataToUserMap(data, dataKey);
    const transformedData = Object.values(userData);
    fs.writeFileSync('result.json', JSON.stringify(transformedData, null, 2));
};

writeTransformedDataToFile(rawData, 'vacations');

console.log('Data transformation complete. Result saved in result.json.');
