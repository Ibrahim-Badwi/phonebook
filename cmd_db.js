const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit();
}

if (process.argv.length === 3) {
  const url = process.env.MONGODB_URI;
  mongoose.set("strictQuery", false);
  mongoose.connect(url);

  Person.find({}).then((result) => {
    console.log(result);
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const password = process.argv[2];
  const name = process.argv[3];
  const number = process.argv[4];

  const url = `mongodb+srv://admin:${password}@mongodb.czbkkdd.mongodb.net/phonebookApp?retryWrites=true&w=majority`;
  mongoose.set("strictQuery", false);
  mongoose.connect(url);

  const person = new Person({
    name,
    number,
  });

  person.save().then((result) => {
    console.log("person saved");
    console.log(result);
    mongoose.connection.close();
  });
}
