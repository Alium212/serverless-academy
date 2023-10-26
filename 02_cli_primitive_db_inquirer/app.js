import fs from "fs";
import inquirer from "inquirer";

const databaseFile = "usersDatabase.txt";
let users = [];

const loadUsers = () => {
    try {
        const data = fs.readFileSync(databaseFile, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveUsers = () => {
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync(databaseFile, data, "utf8");
};

const isUserExists = (name) => {
    const searchName = name.toLowerCase();
    return users.some((user) => user.user.toLowerCase() === searchName);
};

const searchUser = () => {
    console.log(users);
    inquirer
        .prompt([
            {
                type: "input",
                name: "searchName",
                message: "Enter user's name you want to find in DB:",
            },
        ])
        .then((answers) => {
            const searchName = answers.searchName.toLowerCase();
            const foundUser = users.find(
                (user) => user.user.toLowerCase() === searchName
            );

            if (foundUser) {
                console.log("User found:");
                console.log(foundUser);
            } else {
                console.log("User not found.");
            }
        });
};

const handleExit = () => {
    inquirer
        .prompt([
            {
                type: "confirm",
                name: "searchDB",
                message: "Would you like to search values in the database?",
            },
        ])
        .then((answers) => {
            if (answers.searchDB) {
                searchUser();
            } else {
                console.log("Goodbye!");
            }
        });
};

const getUserDetails = (name) => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "gender",
                message: "Choose your gender:",
                choices: ["male", "female"],
            },
            {
                type: "input",
                name: "age",
                message: "Enter age:",
            },
        ])
        .then((userData) => {
            if (!userData.age) {
                delete userData.age;
            }
            const user = { user: name, ...userData };
            users.push(user);
            saveUsers();
            console.log("User added!");
            addUser();
        });
};

const addUser = () => {
    users = loadUsers();
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Enter the user's name. To cancel press ENTER:",
            },
        ])
        .then((answers) => {
            if (answers.name) {
                if (isUserExists(answers.name)) {
                    console.log("User with this name already exists.");
                    addUser();
                } else {
                    getUserDetails(answers.name);
                }
            } else {
                handleExit();
            }
        });
};

addUser();