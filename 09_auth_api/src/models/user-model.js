const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class User {
    constructor(email, password) {
        this.id = uuidv4();
        this.email = email;
        this.password = bcrypt.hashSync(password, 10);
    }
}

module.exports = User;