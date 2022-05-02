const { v4: uuidv4 } = require('uuid')
const morgan = require('morgan')
const express = require('express')
const app = express()

app.use(express.static('build'))
app.use(express.json())
morgan.token('data', (req) => req.method === 'POST' && JSON.stringify(req.body))
app.use(
  morgan((tokens, req, res) =>
    [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.data(req, res),
    ].join(' ')
  )
)

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
]

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  )
})

app.get('/persons', (request, response) => {
  response.json(persons)
})

app.get('/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

app.post('/persons', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }
  // boolean value of -1 is true
  if (
    persons.findIndex(
      (person) => person.name.toUpperCase() === body.name.toUpperCase()
    ) > 0
  ) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const capitalised = body.name
    .split(' ')
    .map((name) => name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase())
    .join(' ')
  const person = {
    id: uuidv4(),
    name: capitalised,
    number: body.number,
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
