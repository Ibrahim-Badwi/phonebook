require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const Person = require("./models/person");

const app = express();
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

/* morgan assignBody middleware */
const assignBody = (request, response, next) => {
  request.method === "POST"
    ? (request.body = JSON.stringify(request.body))
    : (request.body = "");

  next();
};
/* add body token to morgan */
logger.token(
  "body",
  (getBody = (req) => {
    return req.body;
  })
);
// app.use(assignBody);
// app.use(logger(':method :url :status - :response-time :body'));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");

  next();
};
app.use(requestLogger);

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.status(400).json({
          error: "name must be unique",
        });
      }
    })
    .catch((error) => next(error));

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((result) => {
      const info = `
      <p>Phonebook has info for ( ${result.length} ) people</p>
      <p>${Date()}</p>
    `;
      response.send(info);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((doc) => {
      const res = doc.toJSON({ transform: true });
      //fix send status 204 with content!
      response.status(204).send({ data: res });
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
