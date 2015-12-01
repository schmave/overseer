var
React = require('react'),
    Heatmap = require('./heatmap.jsx'),
    Modal = require('./modal.jsx'),
    DateTimePicker = require('react-widgets').DateTimePicker,
    actionCreator = require('./studentactioncreator'),
    studentStore = require('./StudentStore'),
    Router = require('react-router'),
    Link = Router.Link,
    SwipeHelper = require('./swipeHelpers'),
    Swipes = require('./swipeslisting.jsx'),
    SwipeListing = require('./swipeslisting.jsx');

var exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function () {
        return {
            studentId: this.context.router.getCurrentParams().studentId,
            editing: false
        };
    },
    componentDidMount: function () {
        studentStore.addChangeListener(this._onChange);
        this.setState({student: studentStore.getStudent(this.state.studentId)});
    },
    componentWillUnmount: function () {
        studentStore.removeChangeListener(this._onChange);
    },
    signIn: function () {
        SwipeHelper.validateSignDirection('in');
    },
    signOut: function () {
        SwipeHelper.validateSignDirection('out');
    },
    markAbsent: function () {
        actionCreator.markAbsent(this.state.student);
    },
    studentInToday: function () {
        return this.state.student.last_swipe_date == this.state.student.today;
    },
    getActionButtons: function () {
        var buttons = [];

        if (!this.studentInToday() || this.state.student.last_swipe_type === 'out') {
            buttons.push(<button type="button" id="sign-in" onClick={this.signIn}
                                 className="btn btn-sm btn-info margined">Sign In
            </button>);
        }
        if (!this.studentInToday() || this.state.student.last_swipe_type === 'in') {
            buttons.push(<button type="button" id="sign-out" onClick={this.signOut}
                                 className="btn btn-sm btn-info margined">Sign Out
            </button>);
        }
        if (!this.state.student.absent_today) {
            buttons.push(<button id="absent-button" type="button" onClick={this.markAbsent}
                                 className="btn btn-sm btn-info margined">Absent
            </button>);
        }

        return buttons;
    },
    getDayStatus: function (day) {
        if (day.excused) {
            return '(Excused)';
        } else if (day.override) {
            return '(Given Attendence)';
        } else {
            return '';
        }
    },
    getPreviousDays: function () {
        var selectedDay = this.context.router.getCurrentParams().day;
        if (!selectedDay && this.state.day) {
            //routerc.get().transitionTo('swipes', {studentId :this.state.studentId, day: this.state.day});
        }
        return this.state.student.days.map(function (day, i) {
            return <tr className={day.day === this.getActiveDay(this.state.student) ? "selected" : ""}>
                <td><Link to="student"
                          params={{studentId: this.state.studentId, day: day.day}}>{day.day} {this.getDayStatus(day)}</Link>
                </td>
            </tr>;
        }.bind(this))
    },
    toggleEdit: function () {
        this.setState({editing: !this.state.editing});
    },
    saveChange: function () {
        actionCreator.updateStudent(this.state.student._id, this.refs.name.getDOMNode().value);
        this.toggleEdit();
    },
    getActiveDay: function (student) {
        if (this.context.router.getCurrentParams().day) {
            return this.context.router.getCurrentParams().day;
        } else if (student && student.days[0]) {
            return student.days[0].day;
        } else {
            return '';
        }
    },
    toggleHours: function () {
        this.state.student.olderdate = !!!this.state.student.olderdate;
        actionCreator.toggleHours(this.state.student._id);
    },
    showingStudentName: function () {
        return <div className="col-sm-8" id="studentName">
                  <span id="edit-name" onClick={this.toggleEdit}>
                    <h1 className="pull-left">{this.state.student.name}</h1>
                    <span className="fa fa-pencil edit-student"></span>
                  </span>

            <h2 className="badge badge-red">{(!this.studentInToday() && this.state.student.absent_today) ? 'Absent' : ''}</h2>
        </div>;
    },
    editingStudentName: function () {
        return <div className="col-sm-8 row">
            <div className="col-sm-3" id="nameRow">
                <input ref="name" className="form-control" id="studentName"
                       defaultValue={this.state.student.name}/>
                <button onClick={this.saveChange} className="btn btn-success">
                    <i id="save-name" className="fa fa-check icon-large">Save</i></button>
                <button id="cancel-name" onClick={this.toggleEdit} className="btn btn-danger">
                    <i className="fa fa-times"></i></button>
            </div>
            <div>
                <div><input type="radio" name="older" onChange={this.toggleHours}
                            checked={!this.state.student.olderdate}/> 300 Minutes
                </div>
                <div><input type="radio" name="older" onChange={this.toggleHours}
                            checked={this.state.student.olderdate}/> 330 Minutes
                </div>
            </div>
        </div>;
    },
    render: function () {
        if (this.state.student) {
            var activeDate = this.getActiveDay(this.state.student);
            return <div className="row">
                <Modal ref="missingSwipeCollector"
                       title={"What time did you sign " + this.state.missingdirection + "?"}>
                    <form className="form-inline">
                        <div className="form-group">
                            <label htmlFor="missing">What time did you sign {this.state.missingdirection}?</label>
                <DateTimePicker id="missing" defaultValue={SwipeHelper.getMissingTime(this)} ref="missing_swiperef"
                                            calendar={false}/>
                        </div>
                        <div className="form-group" style={{marginLeft: '2em'}}>
                <button id="submit-missing" className="btn btn-sm btn-primary" onClick={SwipeHelper.swipeWithMissing(this)}>
                                Sign {this.state.missingdirection} </button>
                        </div>
                    </form>
                </Modal>

                <div className="col-sm-1"></div>
                <div className="col-sm-10">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            <div className="row">
                                {!this.state.editing ? this.showingStudentName() : this.editingStudentName()}
                                <div className="col-sm-4">
                                    <div id="hd-attended" className="col-sm-6"><b>Attended:</b> {this.state.student.total_days}</div>
                                    <div id="hd-absent" className="col-sm-6"><b>Absent:</b> {this.state.student.total_abs}</div>
                                    <div id="hd-excused" className="col-sm-6"><b>Excused:</b> {this.state.student.total_excused}</div>
                                    <div id="hd-given" className="col-sm-6"><b>Gave
                                        Attendance:</b> {this.state.student.total_overrides}
                                    </div>
                                    <div id="hd-short" className="col-sm-6"><b>Short:</b> {this.state.student.total_short}</div>
                                    <div id="hd-required-mins" className="col-sm-6"><b>Required
                                        Minutes:</b> {this.state.student.olderdate ? 330 : 300}</div>
                                </div>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-sm-7">
                                    <div className="row">
                                        {this.getActionButtons()}
                                    </div>
                                    <Heatmap days={this.state.student.days}/>
                                </div>
                                <div className="col-sm-2">
                                    <table className="table table-striped center">
                                        <thead>
                                        <tr>
                                            <th className="center">Attendance</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.getPreviousDays()}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-sm-2">
                                    {activeDate && this.state.student
                                        ? <Swipes student={this.state.student} day={activeDate}/>
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-1"></div>
            </div>;

        }

        return <div></div>
            ;
    },
    _onChange: function () {

        if (this.refs.missingSwipeCollector) {
            this.refs.missingSwipeCollector.hide();
        }
        var s = studentStore.getStudent(this.state.studentId);

        var activeDay = this.getActiveDay(s);
        this.setState({
            student: s,
            activeDay: activeDay
        });
    }
});

module.exports = exports;
