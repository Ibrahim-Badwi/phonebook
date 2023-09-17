const express = require('express');
const cors = require('cors')
const logger = require('morgan');
const app = express();

app.use(cors())
app.use(express.json());

/* morgan assignBody middleware */
const assignBody = (request, response, next) => {
  request.method === 'POST'
    ? (request.body = JSON.stringify(request.body))
    : (request.body = '');

  next();
};
/* add body token to morgan */
logger.token(
  'body',
  (getBody = (req) => {
    return req.body;
  })
);
// app.use(assignBody);
// app.use(logger(':method :url :status - :response-time :body'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');

  next();
};
app.use(requestLogger);

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }

  const found = persons.find((p) => p.name === body.name);

  if (found) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  const person = {
    id: Math.floor(Math.random() * 1600),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  return response.json(person);
});

app.head('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((p) => p.id === id);

  if (person) {
    return response.json(person);
  } else {
    return response.status(404).end();
  }
});

app.get('/info', (request, response) => {
  const info = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${Date()}</p>`;

  response.send(info);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const PORT = 3001 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
