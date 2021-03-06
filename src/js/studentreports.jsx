var reportStore = require('./reportstore'),
    classStore = require('./classstore'),
    Modal = require('./modal.jsx'),
    Router = require('react-router'),
    Link = Router.Link,
    DateTimePicker = require('react-widgets').DateTimePicker,
    actionCreator = require('./reportactioncreator'),
    React = require('react'),
    Griddle = require('griddle-react');

// Table data as a list of array.
var getState = function () {
    return {rows: [],
            classesAndThings: classStore.getClasses(),
            classes: [],
            years: reportStore.getSchoolYears()};
};
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function deciHours(time) {
    if (!time) {return "0:00";}
    var i = parseInt(time, 10);
    return i.toString() + ":" + pad(Math.round(((time-i)*60),10), 2);
}

class StudentTotalComponent extends React.Component {
    render() {
        var t = deciHours(this.props.data);
        return <span>{t}</span>;
    }
}

class StudentAttendendedComponent extends React.Component {
    render() {
      var good = this.props.rowData.good;
      var short = this.props.rowData.short;

      var good = (good + short) + " (" + short +  ")";
      return <span>{good}</span>;
    }
}

class StudentLinkComponent extends React.Component {
    render() {
      //url ="#speakers/" + props.rowData._id + "/" + this.props.data;
      var sid = this.props.rowData._id,
          name = this.props.data;
      return <Link to={"/students/" + sid} id={"student-" + sid}>{name}</Link>;
    }
}

class StudentReports extends React.Component {
    state = getState();

    componentDidMount() {
        reportStore.addChangeListener(this.onReportChange);
        classStore.addChangeListener(this.onClassChange);
        classStore.getClasses(true);
        reportStore.getSchoolYears(true);
        this.fetchReport(this.state.selectedClassId, this.state.currentYear);
    }

    componentWillUnmount() {
        reportStore.removeChangeListener(this.onReportChange);
        classStore.removeChangeListener(this.onClassChange);
    }

    onClassChange = () => {
        this.refs.newSchoolYear.hide();
        var classesAndThings= classStore.getClasses(),
            state = this.state,
            classes = (classesAndThings ==[]) ? [] : classesAndThings.classes,
            currentSelectedClassId = this.state.selectedClassId,
            matching = classes.filter(cls => cls._id === currentSelectedClassId),
            selectedClass = matching[0] || classes[0];
        if(classes != [] && !currentSelectedClassId) {
            selectedClass = classes.filter(cls => cls.active == true)[0];
        }
        state.selectedClass = selectedClass || {};
        state.selectedClassId = state.selectedClass ? state.selectedClass._id : null;
        state.classes = classes;
        this.setState(state);
        this.fetchReport(state.selectedClassId, state.currentYear);
    };

    onReportChange = (x) => {
        this.refs.newSchoolYear.hide();
        var state = this.state,
            years = reportStore.getSchoolYears(),
            yearExists = years.years.indexOf(state.currentYear) !== -1,
            currentYear = (yearExists && state.currentYear) ? state.currentYear : years.current_year;

        state.years=years;
        state.currentYear=currentYear;

        this.setState(state);
        this.fetchReport(this.state.selectedClassId, currentYear);
    };

    fetchReport = (currentClassId, year) => {
        var report = reportStore.getReport(year, currentClassId),
            rows = (report != "loading") ? report : [];
        this.setState({loading: (report==null||report=="loading"), rows: rows});
    };

    classSelected = (event) => {
        var currentClassId = event.target.value,
            matching = this.state.classes.filter(cls => cls._id == currentClassId),
            selectedClass = (matching[0]) ? matching[0] : this.state.classes[0];
        this.setState({selectedClass: selectedClass,
                       selectedClassId: selectedClass._id});
        this.fetchReport(selectedClass._id, this.state.currentYear);
    };

    yearSelected = (event) => {
        var currentYear = event.target.value;
        this.setState({currentYear: currentYear});
        this.fetchReport(this.state.selectedClassId, currentYear);
    };

    createPeriod = () => {
        actionCreator.createPeriod(this.state.startDate, this.state.endDate);
    };

    deletePeriod = () => {
        actionCreator.deletePeriod(this.state.currentYear);
    };

    dateToString = value => {
      return (value.getYear() + 1900) + "-" + (value.getMonth() + 1) + "-" + value.getDate();
    }

    onStartDateChange = value => {
      this.setState({ startDate: this.dateToString(value) });
    }

    onEndDateChange = value => {
      this.setState({ endDate: this.dateToString(value) });
    }

    render() {
        var grid = null;
        if(this.state.loading) {
            grid = <div>Loading</div>;
        }else {

            grid = <Griddle id="test" results={this.state.rows} resultsPerPage="200"
                            columns={['name', 'good', 'overrides', 'unexcused', 'excuses', 'short', 'total_hours']}
                            columnMetadata={[{displayName: 'Name',
                                              columnName: 'name',
                                              customComponent: StudentLinkComponent },
                                             {displayName: 'Attended',
                                              customComponent: StudentAttendendedComponent,
                                              columnName: 'good'},
                                             {displayName: 'Overrides', columnName: 'overrides'},
                                             {displayName: 'Unexcused', columnName: 'unexcused'},
                                             {displayName: 'Excused Absence', columnName: 'excuses'},
                                             {displayName: 'Short', columnName: 'short'},
                                             {displayName: 'Total Hours', columnName: 'total_hours', customComponent: StudentTotalComponent}
                                ]}/>;
        }
        return <div>
            <div className="row margined">
                <select id="class-select" className="pull-left"
                        onChange={this.classSelected}
                        value={this.state.selectedClassId}>
                    {this.state.classes ? this.state.classes.map(function (cls) {
                         return <option key={cls._id} value={cls._id}>{cls.name}</option>;
                     }.bind(this)) : ""}
                </select>
                <select className="pull-left" onChange={this.yearSelected}
                        value={this.state.currentYear}>
                    {this.state.years ? this.state.years.years.map(function (year) {
                         return <option key={year} value={year}> {year === this.state.years.current_year ? year + " (Current)" : year}
                         </option>;
                     }.bind(this)) : ""}
                </select>
                <button className="pull-left delete-button btn btn-small btn-danger fa fa-trash-o"
                        onClick={this.deletePeriod}>
                </button>
                <button className="pull-right btn btn-small btn-success"
                        onClick={function(){this.refs.newSchoolYear.show();}.bind(this)}>New Period
                </button>
            </div>
            {grid}
            <Modal ref="newSchoolYear" title="Create new period">
                <form className="form-inline">
                    <div className="form-group">
                        <label htmlFor="startDate">Start:</label>
                        <DateTimePicker id="startDate" onChange={this.onStartDateChange} time={false}/>
                        <label htmlFor="endDate">End:</label>
                        <DateTimePicker id="endDate" onChange={this.onEndDateChange} time={false}/>
                    </div>
                    <div className="form-group" style={{marginLeft: '2em'}}>
                        <button className="btn btn-sm btn-primary" onClick={this.createPeriod}>Create Period</button>
                    </div>
                </form>
            </Modal>
        </div>;
    }
}

module.exports = StudentReports;
