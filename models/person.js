const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose
  .connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  number: {
    type: String,
    required: true,
    validate: {
      validator: number => {
        const parts = number.split('-')
        const joinParts = parts.join('')
        // return false if not consists of numbers only
        if (!/^\d+$/.test(joinParts)) {
          return false
        }
        // return false if seperated in more than 2 parts
        if (parts.length > 2) {
          return false
        }
        // return false if the first part doesn't have 2 or 3 number
        if (parts.length === 2) {
          if (!(parts[0].length === 2 || parts[0].length === 3)) {
            return false
          }
        }
        // return false if total length less than 8
        if (joinParts.length < 8) {
          return false
        }

        return true
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)