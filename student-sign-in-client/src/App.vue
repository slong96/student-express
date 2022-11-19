<template>

  <div id="app">

    <NewStudentForm v-on:student-added="newStudentAdded"></NewStudentForm>
    <StudentTable v-bind:students="students" 
                  v-on:student-arrived-or-left="studentArrivedOrLeft"
                  v-on:delete-student="studentDeleted"></StudentTable>
    <StudentMessage v-bind:student="mostRecentStudent"></StudentMessage>

  </div>

</template>

<script>

import NewStudentForm from './components/NewStudentForm.vue'
import StudentMessage from './components/StudentMessage.vue'
import StudentTable from './components/StudentTable.vue'

export default {
  name: 'App',
  components: {
    NewStudentForm,
    StudentMessage,
    StudentTable
  },
  data() {
    return {
      students: [],
      mostRecentStudent: {}
    }
  },
  mounted() {
    // load all students - make request to API
    this.updateStudents()
  },

  methods: {
    updateStudents() {
      this.$student_api.getAllStudents().then( students => {
        // this.students is the "data() students: []"
        this.students = students
      }).catch( () => alert('Unable to fetch student list'))
    },

    newStudentAdded(student) {
      this.$student_api.addStudent(student).then( () => {
        this.updateStudents()
      }).catch(err => {
        alert('Error adding student. Star ID must be unique.')
      })
    },
    studentArrivedOrLeft(student, present) {
      student.present = present // update present value
      this.$student_api.updateStudent(student).then( () => {
        this.mostRecentStudent = student
        this.updateStudents()
      }).catch( () => alert('Unable to update student'))
    },
    studentDeleted(student) {
      this.$student_api.deleteStudent(student.id).then( () => {
        this.updateStudents()
        this.mostRecentStudent = {} // clear welcome/goodbye message
      }).catch( () => alert('Unable to delete student'))
    }
  }
}
</script>

<style>
@import 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
</style>
