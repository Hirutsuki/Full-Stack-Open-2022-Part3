const mongoose = require('mongoose')

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

if (commandLen === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

if (commandLen === 5) {
  const person = new Person({ name: process.argv[3], number: process.argv[4] })
  person.save().then((result) => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}