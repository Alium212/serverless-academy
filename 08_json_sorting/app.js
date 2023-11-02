const axios = require('axios');

const MAX_ATTEMPTS = 3;
const endpoints = [
    'https://jsonbase.com/sls-team/json-793',
    'https://jsonbase.com/sls-team/json-955',
    'https://jsonbase.com/sls-team/json-231',
    'https://jsonbase.com/sls-team/json-931',
    'https://jsonbase.com/sls-team/json-93',
    'https://jsonbase.com/sls-team/json-342',
    'https://jsonbase.com/sls-team/json-770',
    'https://jsonbase.com/sls-team/json-491',
    'https://jsonbase.com/sls-team/json-281',
    'https://jsonbase.com/sls-team/json-718',
    'https://jsonbase.com/sls-team/json-310',
    'https://jsonbase.com/sls-team/json-806',
    'https://jsonbase.com/sls-team/json-469',
    'https://jsonbase.com/sls-team/json-258',
    'https://jsonbase.com/sls-team/json-516',
    'https://jsonbase.com/sls-team/json-79',
    'https://jsonbase.com/sls-team/json-706',
    'https://jsonbase.com/sls-team/json-521',
    'https://jsonbase.com/sls-team/json-350',
    'https://jsonbase.com/sls-team/json-64',
];

const findIsDoneValue = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }

    const stack = [obj];
    
    while (stack.length > 0) {
        const currentObj = stack.pop();
        if ('isDone' in currentObj) {
            return currentObj.isDone;
        }

        for (const key in currentObj) {
            const value = currentObj[key];
            if (value && typeof value === 'object') {
                stack.push(value);
            }
        }
    }

    return undefined;
};

const handleResponse = (response, endpoint) => {
    if (!response.data) {
        console.log(`[Fail] ${endpoint}: The response is not valid JSON.`);
    } else {
        const isDoneValue = findIsDoneValue(response.data);
        const message = isDoneValue !== undefined
            ? `[Success] ${endpoint}: isDone - ${isDoneValue}`
            : `[Fail] ${endpoint}: The isDone key is missing in the response.`;
        console.log(message);
    }
};

const handleUnavailableEndpoint = (endpoint) => {
    console.log(`[Fail] ${endpoint}: The endpoint is unavailable`);
};

const fetchData = async (endpoint) => {
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        try {
            const response = await axios.get(endpoint);
            handleResponse(response, endpoint);
            return;
        } catch (error) {
            attempts++;
            if (attempts === MAX_ATTEMPTS) {
                handleUnavailableEndpoint(endpoint);
            }
        }
    }
};

const processEndpoints = async () => {
    for (const endpoint of endpoints) {
        await fetchData(endpoint);
    }
};

processEndpoints();
