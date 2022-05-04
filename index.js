const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const express = require('express')
const app = express()

const commandLen = process.argv.length
if (commandLen < 3) {
  console.log(
    'Please provide at least the password as argument: node mongo.js <password> [name] [number]'
  )
  process.exit(1)
}

const url = `mongodb+srv://admin-lu:${process.argv[2]}@cluster0.ali19.mongodb.net/phonebookDB?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

app.use(cors())
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

// let persons = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456',
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendieck',
//     number: '39-23-6423122',
//   },
// ]

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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

  const guid = () => {
    new Date().getTime() + Math.floor(Math.random() * 10)
  }

  const capitalised = body.name
    .split(' ')
    .map((name) => name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase())
    .join(' ')
  const person = {
    id: guid(),
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
