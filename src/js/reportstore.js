var EventEmitter = require('events').EventEmitter,
    dispatcher = require('./appdispatcher'),
    base = require('./storebase'),
    constants = require('./appconstants'),
    actionCreator = require('./reportactioncreator');

var isAdmin;
var reports = {};
var schoolYears;

var exports = Object.create(base);

exports.getSchoolYears = function () {
    if (!schoolYears) {
        actionCreator.loadSchoolYears();
    } else {
        return schoolYears;
    }
};

exports.getReport = function (year) {
    if (!year) return [];
    if (reports[year]) {
        return reports[year];
    } else if (!reports[year] || reports[year] === 'loading') {
        reports[year] = 'loading';
        actionCreator.loadReport(year);
    }
    return [];
};

exports.removeChangeListener = function (callback) {
    this.removeListener(this.CHANGE_EVENT, callback);
    if (this.listeners(this.CHANGE_EVENT).length == 0) {
        reports = {};
    }
};

dispatcher.register(function (action) {
    switch (action.type) {
        case constants.reportEvents.YEARS_LOADED:
            schoolYears = action.data;
            exports.emitChange();
            break;
        case constants.reportEvents.REPORT_LOADED:
            reports[action.data.year] = action.data.report;
            exports.emitChange();
            break;
    }
});

module.exports = exports;