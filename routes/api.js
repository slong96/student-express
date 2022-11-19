let express = require('express')
let db = require('../models')
let Student = db.Student

let router = express.Router()

router.get('/students', function(req, res, next) {
  // find all students in the student table
  Student.findAll( {order: [
    // order by present
    'present',
    // and then by lower versions of starID - a case-insensive sort
     db.Sequelize.fn('lower', db.Sequelize.col('starID'))
    ]}).then( students => {
    // convert into json and return
    return res.json(students)
  }).catch(err => next(err))
})

// post is to create a record on the server
router.post('/students', function(req, res, next) {
  // contains any json that are vue client has sent in the request.
  // create a new student object using the body of the data.
  Student.create( req.body ).then( data => {
    // return a status code (example: 404 is a common one)
    return res.status(201).send('ok')
  }).catch(err => {
    // handle user errors, missing starID or name
    if (err instanceof db.Sequelize.ValidationError) {
      // respond with 400 Bad Request error code
      let messages = err.errors.map( e => e.message)
      return res.status(400).json(messages)
    }
    // otherwise, something unexpected has gone wrong.
    return next(err)
  })
})

// edit a student
router.patch('/students/:id', function(req, res, next) {
  // request is to /students/100,
  // then studentID will be 100
  let studentID = req.params.id
  let updatedStudent = req.body
  Student.update(updatedStudent, { where: { id: studentID } } )
  .then( (rowsModified) => {

    let numberOfRowsModified = rowsModified[0] // number of rows changed

    // exactly one row
    if (numberOfRowsModified == 1) {
      return res.send('ok')
      // no rows - student not found - return 404
    } else {
      // student not found
      return res.status(404).json(['Student with that ID not found.'])
    }
  }).catch(err => {
    // if validation error, that's a bad request - modify student to have no name
    if (err instanceof db.Sequelize.ValidationError) {
      let messages = err.errors.map( e => e.message)
      return res.status(400).json(messages)
      } else {
        // unexpected error
        return next(err)
    }
  })
})

// delete a student
router.delete('/students/:id', function(req, res, next) {
  let studentID = req.params.id
  Student.destroy( {where: { id: studentID } } )
    .then( (rowsDeleted) => {
      if (rowsDeleted == 1) {
        return res.send('ok')
      } else {
        return res.status(404).json(['Not found'])
      }
    }).catch(err => next(err)) // unexpected errors.
  })

module.exports = router

// don't write code here below, it will be ignored