require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
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
  Person.findById(request.params.id).then((person) => response.json(person))
  // } else {
  //   response.status(404).end()
  // }
})

app.delete('/api/persons', (request, response) => {
  Person.collection.drop()
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

  const capitalised = body.name
    .split(' ')
    .map((name) => name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase())
    .join(' ')
  const person = new Person({
    name: capitalised,
    number: body.number,
  })
  person.save().then((savedPerson) => response.json(savedPerson))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
