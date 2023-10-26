const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const MESSAGES = {
    greeting: 'Hello. Enter 10 words or digits dividing them with spaces: ',
    options: 'What would you like to do with the input?\n1. Words by name (from A to Z).\n2. Show digits from the smallest.\n3. Show digits from the biggest.\n4. Words by the quantity of letters.\n5. Only unique words.\n\nSelect (1 - 5) and press ENTER: ',
    invalidChoice: 'Invalid choice. Please enter a number between 1 and 5.',
    exitMessage: 'Goodbye! Come back again!',
};

const startApp = () => {
    rl.question(MESSAGES.greeting, (input) => {
        processInput(input);
    });
};

const sortData = (arr, sortBy) => {
    const copyArr = [...arr];
    switch (sortBy) {
        case 'alphabet':
            copyArr.sort((a, b) => a.localeCompare(b));
            break;
        case 'asc':
            copyArr.sort();
            break;
        case 'desc':
            copyArr.sort((a, b) => b - a);
            break;
        case 'length':
            copyArr.sort((a, b) => a.length - b.length);
            break;
    }

    console.log(copyArr);
    startApp();
    return copyArr;
};

const splitNumbersAndWords = (input) => {
    const values = input.split(' ');
    const isNumber = (value) => !isNaN(value);
    const numbers = values.filter(isNumber);
    const words = values.filter((value) => !isNumber(value));

    return { numbers, words };
};

const processInput = (input) => {
    const {numbers, words} = splitNumbersAndWords(input);

    rl.question(MESSAGES.options, (choice) => {
        switch (choice) {
            case '1':
                sortData(words, 'asc');
                break;
            case '2':
                sortData(numbers, 'asc');
                break;
            case '3':
                sortData(numbers, 'desc');
                break;
            case '4':
                sortData(words, 'length');
                break;
            case '5':
                console.log([...new Set(words)]);
                startApp();
                break;
            case 'exit':
                console.log(MESSAGES.exitMessage);
                rl.close();
                break;
            default:
                console.log(MESSAGES.invalidChoice);
                startApp();
        }
    });
};

startApp();