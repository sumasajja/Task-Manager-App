const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = 'mongodb://localhost:27017';
const databaseName = 'mydb';
const id = new ObjectID();
console.log(id);

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log(error);
    }
    const db = client.db(databaseName);

})