var eventEmitter = require('events').EventEmitter,
    constants = require('./appconstants'),
    ajax = require('./ajaxhelper'),
    myhistory = require('./myhistory.js'),
    dispatcher = require('./appdispatcher');

var exports = {
    loadAllStudents: function () {
        $.ajax({
            url: '/allstudents'
        }).then(function (data) {
            dispatcher.dispatch({
                type: constants.studentEvents.ALL_LOADED,
                data: data
            });
        });
    },
    loadStudents: function () {
        $.ajax({
            url: '/students'
        }).then(function (data) {
            dispatcher.dispatch({
                type: constants.studentEvents.LOADED,
                data: data
            });
        });
    },
    loadStudent: function (id) {
        ajax.get('/students/' + id)
            .then(function (data) {
                dispatcher.dispatch({
                    type: constants.studentEvents.STUDENT_LOADED,
                    data: data.student
                });
            });
    },
    createStudent: function (name, start_date, email, minutes, is_teacher) {
        ajax.post('/students', {
            name: name,
            email: email,
            start_date: start_date,
            minutes: minutes,
            is_teacher: is_teacher
        }).then(function (data) {
            dispatcher.dispatch({
                type: constants.studentEvents.ALL_LOADED,
                data: data.students
            });
            if(data.made) {
                dispatcher.dispatch({
                    type: constants.systemEvents.FLASH,
                    message: 'Successfully created ' + data.made.name + '.'
                });
                myhistory.replaceState(null, 'studentAdmin');
            } else {
                dispatcher.dispatch({
                    type: constants.systemEvents.FLASH,
                    message: 'Student ' + name + ' already exists.',
                    level: 'error'
                });
            }
        }.bind(this), function (error) {
            dispatcher.dispatch({
                type: constants.systemEvents.FLASH,
                message: 'An error occurred during creation.'
            });
        });
    },
    makeUser: function (name, password) {
        ajax.put('/user', {
            name: name,
            password: password
        }).then(function (data) {
            this.loadStudents();
            dispatcher.dispatch({
                type: constants.studentEvents.STUDENT_LOADED,
                data: data
            });
        }.bind(this));
    },
    updateStudent: function (id, name, start_date, email, minutes, is_teacher) {
        ajax.put('/students/' + id, {
            name: name,
            start_date: start_date,
            email: email,
            minutes: minutes,
            is_teacher: is_teacher
        }).then(function (data) {
            this.loadStudents();
            dispatcher.dispatch({
                type: constants.studentEvents.STUDENT_LOADED,
                data: data.student
            });
        }.bind(this));
    },
    swipeStudent: function (student, direction, missing) {
        //var student = student;
        ajax.post('students/' + student._id + '/swipe', {direction: direction, missing:missing})
            .then(function (data) {
                dispatcher.dispatch({
                    type: constants.studentEvents.STUDENT_SWIPED,
                    data: data
                });
                //this.loadStudent(student._id);
                dispatcher.dispatch({
                    type: constants.systemEvents.FLASH,
                    message: student.name + ' swiped successfully!'
                });
                //student = null;
                myhistory.replaceState(null, '/students');
            }.bind(this));
    },
    toggleArchived: function (id) {
        ajax.post('/students/' + id + '/togglearchived')
            .then(function (data) {
                dispatcher.dispatch({
                    type: constants.studentEvents.STUDENT_LOADED,
                    data: data.student
                });
                this.loadStudents();
            }.bind(this));
    },
    toggleHours: function (id) {
        ajax.post('/students/' + id + '/togglehours')
            .then(function (data) {
                dispatcher.dispatch({
                    type: constants.studentEvents.STUDENT_LOADED,
                    data: data.student
                });
                this.loadStudents();
            }.bind(this));
    },
    markAbsent: function (student) {
        ajax.post('/students/' + student._id + '/absent')
            .then(function (data) {
                dispatcher.dispatch({
                    type: constants.studentEvents.MARKED_ABSENT,
                    data: data.student
                });
                this.loadStudents();
            }.bind(this));
    },
    deleteSwipe: function(swipe, student){
        ajax.post('/students/' + student._id + '/swipe/delete', {swipe: swipe}).then(function(data){
            dispatcher.dispatch({
                type: constants.studentEvents.STUDENT_LOADED,
                data: data.student
            });
        });
    },
    excuse: function(studentId, day){
        ajax.post('students/' + studentId + '/excuse',{day: day})
            .then(function(data){
                this.loadStudent(studentId);
            }.bind(this));
    },
    override: function(studentId, day){
        ajax.post('/students/' + studentId + '/override',{day: day})
            .then(function(data){
                this.loadStudent(studentId);
            }.bind(this));
    }
};

module.exports = exports;
