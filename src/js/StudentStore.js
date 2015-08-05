var EventEmitter = require('events').EventEmitter,
    dispatcher = require('./appdispatcher'),
    assign = require('object-assign'),
    constants = require('./appconstants'),
    actionCreator = require('./studentactioncreator');

var CHANGE_EVENT = 'change';

var students;
var studentDetails = {};

function getStudents(){
    if(students){
        return students;
    }else{
        actionCreator.loadStudents();
        return [];
    }
}

function getStudent(id){
    actionCreator.loadStudent(id);
    if(studentDetails[id]){
        return studentDetails[id];
    }else{
        return null;
    }
}

var exports = assign({}, EventEmitter.prototype, {
    getStudents: getStudents,
    getStudent: getStudent,
    emitChange: function(){
        this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback){
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback){
        this.removeListener(CHANGE_EVENT, callback);
    }
});

dispatcher.register(function(action){
    switch(action.type){
        case constants.studentEvents.LOADED:
            students = action.data;
            exports.emitChange();
            break;
        case constants.studentEvents.STUDENT_SWIPED:
            actionCreator.loadStudents();
            break;
        case constants.studentEvents.STUDENT_LOADED:
        case constants.studentEvents.MARKED_ABSENT:
            studentDetails[action.data._id] = action.data;
            exports.emitChange();
            break;
    }
});

module.exports = exports;