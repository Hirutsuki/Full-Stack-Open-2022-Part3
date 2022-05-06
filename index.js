require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('data', req => req.method === 'POST' && JSON.stringify(req.body))
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
      tokens.data(req, res)
    ].join(' ')
  )
)

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p><p>${new Date()}</p>`
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }
  // instantly check backend db to see if name exist
  Person.find({ name: body.name }).then(foundPerson => {
    // find() returns [] when couldn't find
    if (foundPerson.length === 0) {
      // save person when no matching name found
      const person = new Person({
        name: body.name,
        number: body.number
      })
      person
        .save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error))
    } else {
      return response
        .status(400)
        .json({ error: `${body.name} already in the phonebook` })
    }
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const { name, number } = { ...body }
  const newPerson = { name, number }

  Person.findByIdAndUpdate(request.params.id, newPerson, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => {
      // findByIdAndUpdate() returns null when couldn't find
      if (!updatedPerson) {
        response.status(500).json('inexistent')
      } else {
        response.json(updatedPerson)
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  // some of the remove() methods are already deprecated, delete() is more advisable
  Person.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})