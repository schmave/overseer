var React = require('react'),
    Heatmap = require('./heatmap.jsx'),
    actionCreator = require('./studentactioncreator'),
    studentStore = require('./StudentStore'),
    Router = require('react-router'),
    Link = Router.Link,
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
        actionCreator.swipeStudent(this.state.student, 'in');
    },
    signOut: function () {
        actionCreator.swipeStudent(this.state.student, 'out');
    },
    markAbsent: function () {
        actionCreator.markAbsent(this.state.student);
    },
    getActionButtons: function () {
        var buttons = [];

        if (this.state.student.last_swipe_date !== this.state.student.today || this.state.student.last_swipe_type === 'out') {
            buttons.push(<button type="button" onClick={this.signIn}
                                 className="btn btn-sm btn-info margined">Sign In
            </button>);
        }
        if (this.state.student.last_swipe_date !== this.state.student.today || this.state.student.last_swipe_type === 'in') {
            buttons.push(<button type="button" onClick={this.signOut}
                                 className="btn btn-sm btn-info margined">Sign Out
            </button>);
        }
        if (!this.state.student.absent_today) {
            buttons.push(<button type="button" onClick={this.markAbsent}
                                 className="btn btn-sm btn-info margined">Absent
            </button>);
        }

        return buttons;
    },
    getDayStatus: function(day){
        if(day.excused){
            return '(Excused)';
        }else if(day.override){
            return '(Overidden)';
        }else{
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
                <td><Link to="student" params={{studentId: this.state.studentId, day: day.day}}>{day.day} {this.getDayStatus(day)}</Link></td>
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
    getActiveDay: function(student){
        if(this.context.router.getCurrentParams().day){
            return this.context.router.getCurrentParams().day;
        }else if(this.state.student){
            return student.days[0].day;
        }else{
            return '';
        }
    },
    render: function () {
        if (this.state.student) {
            var activeDate = this.getActiveDay(this.state.student);
            return <div className="row">
                <div className="col-sm-1"></div>
                <div className="col-sm-10">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            <div className="row">
                                {!this.state.editing ?
                                    <div className="col-sm-8">
                                        <span><h1 className="pull-left">{this.state.student.name}</h1> <span
                                            onClick={this.toggleEdit}
                                            className="fa fa-pencil edit-student"></span></span>

                                        <h2 className="badge badge-red">{this.state.student.absent_today ? 'Absent' : ''}</h2>
                                    </div> :
                                    <div className="col-sm-8 row">
                                        <div className="col-sm-3">
                                            <input ref="name" className="form-control" id="studentName"
                                                   defaultValue={this.state.student.name}/>
                                            <button onClick={this.saveChange} className="btn btn-success"><i
                                                className="fa fa-check icon-large"></i></button>
                                            <button onClick={this.toggleEdit} className="btn btn-danger"><i
                                                className="fa fa-times"></i></button>
                                        </div>
                                    </div>
                                }
                                <div className="col-sm-4">
                                    <div className="col-sm-6"><b>Attended:</b> {this.state.student.total_days}</div>
                                    <div className="col-sm-6"><b>Absent:</b> {this.state.student.total_abs}</div>
                                    <div className="col-sm-6"><b>Excused:</b> {this.state.student.total_excused}</div>
                                    <div className="col-sm-6"><b>Overrides:</b> {this.state.student.total_overrides}
                                    </div>
                                    <div className="col-sm-6"><b>Short:</b> {this.state.student.total_short}</div>
                                </div>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-sm-7">
                                    <div className="row">
                                        {this.getActionButtons()}
                                    </div>
                                    <Heatmap days={this.state.student.days} />
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
                                        ? <Swipes student={this.state.student} day={activeDate} />
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
        var s = studentStore.getStudent(this.state.studentId);

        var activeDay = this.getActiveDay(s);
        this.setState({
            student: s,
            activeDay: activeDay
        });
    }
});

module.exports = exports;
