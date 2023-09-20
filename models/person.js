const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);
console.log("connecting to", url);

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [3, "name must be at least 3 characters"],
    required: true,
  },
  number: {
    type: String,
    minlength: [8, "phone number must be at least 8 digits"],
    match: [/^\d{2,3}-\d{8}$/, "use one of these formats 01-12345678 or 001-12345678"]
    // validate: {
    //   validator: function(v) {
    //     return /^\d{2,3}-\d{8}$/.test(v);
    //   },
    //   message: props => `${props.value} is not a valid phone number, use one of these formats 01-12345678 or 001-12345678`
    // },
  }
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Person", personSchema);