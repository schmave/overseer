var EventEmitter = require('events').EventEmitter,
    dispatcher = require('./appdispatcher'),
    constants = require('./appconstants'),
    base = require('./storebase'),
    actionCreator = require('./studentactioncreator');

var students, today;
var studentDetails = {};

var exports = Object.create(base);

exports.getStudents = function(force){
    if(!force && students){
        return students;
    }else{
        actionCreator.loadStudents();
        return [];
    }
};

exports.getToday = function(){
    return today;
};

exports.getStudent = function(id){
    if(studentDetails[id]){
        return studentDetails[id];
    }else{
        actionCreator.loadStudent(id);
        return null;
    }
};

dispatcher.register(function(action){
    switch(action.type){
        case constants.studentEvents.LOADED:
            students = action.data.students;
            today = action.data.today;
            exports.emitChange();
            break;
        case constants.studentEvents.STUDENT_SWIPED:
            students = action.data.students;
            studentDetails[action.data.student._id] = action.data.student;
            exports.emitChange();
            break;
        case constants.studentEvents.STUDENT_LOADED:
        case constants.studentEvents.MARKED_ABSENT:
            studentDetails[action.data._id] = action.data;
            exports.emitChange();
            break;
    }
});

module.exports = exports;
