var React = require('react'),
    Router = require('react-router'),
    helpers= require('./helpers/some'),
    classStore = require('./classstore'),
    userStore = require('./userstore'),
    actionCreator = require('./classactioncreator'),
    Link = Router.Link,
    AdminWrapper = require('./adminwrapper.jsx'),
    studentStore = require('./StudentStore'),
    ClassEditor = require('./classes/classEditor.jsx'),
    FilterBox = require('./filterbox.jsx');

module.exports = class Classes extends React.Component {
    state = {classes:classStore.getClasses(true),
            filterText: '',
            students: studentStore.getAllStudents(true),
            selectedClass: {students:[]}};

    setupState = (classes, students) => {
        var selectedClass = this.state.selectedClass;
        if(selectedClass && selectedClass._id) {
            var id = selectedClass._id,
                matching = classes.filter(function(cls) {return cls._id === id;});
            selectedClass = (matching[0]) ? matching[0] : classes[0];
        } else {
            if(classes.length > 0) {
                var activeClasses = classes.filter((cls)=> cls.active);
                if(activeClasses.length > 0) {
                    selectedClass = activeClasses[0];
                } else {
                    selectedClass = {students:[]};
                }
            } else {
                selectedClass = {students:[]};
            }
        }
        this.setState({classes: classes,
                       students: students,
                       selectedClass: (selectedClass)?selectedClass:{students:[]}});
    };

    componentDidMount() {
        classStore.addChangeListener(this._onClassChange);
        studentStore.addChangeListener(this._onStudentChange);
    }

    componentWillUnmount() {
        studentStore.removeChangeListener(this._onStudentChange);
        classStore.removeChangeListener(this._onClassChange);
    }

    _onClassChange = () => {
        this.setupState(classStore.getClasses().classes, this.state.students);
    };

    _onStudentChange = () => {
        this.setupState(this.state.classes, studentStore.getAllStudents());
    };

    classSelected = (classval) => {
        this.setState({selectedClass: classval});
    };

    classRows = () => {
        return this.state.classes.map(function (classval, i) {
            var boundClick = this.classSelected.bind(this, classval),
                selected = (classval._id === this.state.selectedClass._id)  ? "selected" : "";

            var bnp = this.makeActivateClassButtonAndPanel(classval);
            var activeTag = bnp.panel;
            var button = bnp.button;
            /* var activeTag = null;
             * if (classval.active) {
             *     activeTag = <span className="pull-right margined badge badge-green">Active</span>;
             * }*/
            return (<tr key={classval._id}
                        id={classval.name}
                        onClick={boundClick}
                        className={selected}>
              <td>
                <span className="pull-left">{classval.name}</span>
                {button}
              </td>
            </tr>);
        }.bind(this));
    };

    selectedStudentContains = (stu) => {
        return !this.state.selectedClass.students.some(function(istu){
            return istu.student_id === stu._id;
        });
    };

    deleteFromClass = (student) => {
        actionCreator.deleteStudentFromClass(student.student_id, this.state.selectedClass._id);
    };

    addToClass = (student) => {
        actionCreator.addStudentToClass(student._id, this.state.selectedClass._id);
    };

    activateClass = (_id) => {
        actionCreator.activateClass(_id);
    };

    filterStudents = (s) => {
        return s.filter(function(s){ return s.name.toLocaleLowerCase().indexOf(this.state.filterText.toLocaleLowerCase()) > -1;}.bind(this));
    };

    rankAlphabetically = (a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    };

    getStudentRowsInCurrentClass = () => {
        var a = 1;
        var t = this.filterStudents(this.state.selectedClass.students.sort(this.rankAlphabetically))
                    .map(function (stu) { return <div key={"t" + this.state.selectedClass._id + "-" + stu.student_id}  className="in-class panel panel-info student-listing col-sm-4">
              <div>
                <div className="name"> {stu.name} </div>
                <div className="attendance-button">
                  <button onClick={this.deleteFromClass.bind(this, stu)} className="btn btn-xs btn-primary"><i className="fa fa-arrow-right">&nbsp;</i></button>
                </div>
              </div>
                    </div>;
                    }.bind(this));
        return t;
    };

    getStudentRowsNotInCurrentClass = () => {
        var filtered = this.state.students.sort(this.rankAlphabetically)
                           .filter(this.selectedStudentContains);
        var t = this.filterStudents(filtered)
                    .map(function (stu) {
                        return <div key={"NOTCLASS-" + stu._id} className="out-class panel panel-info student-listing col-sm-11">
                      <div>
                        <div className="attendance-button">
                          <button id={("add-" + stu._id)} onClick={this.addToClass.bind(this, stu)} className="btn btn-xs btn-primary"><i className="fa fa-arrow-left">&nbsp;</i></button>
                        </div>
                        <div className="name"> {stu.name} </div>
                      </div>
                        </div>;
                    }.bind(this));
        return t;
    };

    filterChanged = (filter) => {
        this.setState({filterText: filter});
    };

    toggleEdit = (selectedClass) => {
        if(userStore.isAdmin()) {
           this.refs.classEditor.edit(selectedClass);
        }
    };

    makeActivateClassButtonAndPanel = (selectedClass) => {
        var activateClassButton = null;
        var activeClassPanel = "panel-danger";

        if (selectedClass.active) {
            activateClassButton = <span className=" margined badge badge-green pull-right">Active</span>;
            activeClassPanel = "panel-success";
        }
        else {
            activateClassButton = <button onClick={this.activateClass.bind(this, selectedClass._id)}
                                        id={"activate-"+selectedClass.name}
                                        className="margined btn btn-primary btn-xs pull-right">
                          Activate
            </button>;
        }

        if(userStore.isDstMode()){
            activateClassButton = null;
        }
        return {button:activateClassButton, panel:activeClassPanel};
    };

    render() {

        var createClassLink =
            <button className="btn btn-primary btn-sm" onClick={this.toggleEdit.bind(this, null)}>Add new</button>;
            {/* <Link style={{verticalAlign: "text-bottom"}} className="btn btn-primary btn-xs" id="create-class" to="createaclass">Add new</Link>; */}
        if(userStore.isDstMode()){
            createClassLink = null;
        }

        var panel = this.makeActivateClassButtonAndPanel(this.state.selectedClass).panel;

        return <div>
            <ClassEditor ref="classEditor">
            </ClassEditor>
              <div className="row margined class-listing new-class">
                <div className="col-sm-2 column">
                  <table className="table table-striped center">
                    <thead>
                      <tr>
                        <th className="center">
                          <span className="h2">Classes</span>&nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>
                        {createClassLink}
                      </td></tr>
                      {this.classRows()}
                    </tbody>
                  </table>
                </div>
                <div className="col-sm-10 column">
                  <div className= { "panel " + panel }>
                    <div className="panel-heading absent"><b> { this.state.selectedClass.name } </b>

                        <button className="btn btn-primary btn-sm" onClick={this.toggleEdit.bind(this, this.state.selectedClass)}>Edit</button>
                    </div>
                    <div className="col-sm-10 column">
                      <FilterBox onFilterChange={this.filterChanged} />
                    </div>
                    <div className="col-sm-12 column">
                      <div className="col-sm-6 column">
                        <div className= { "panel " + panel }>
                          <div className="panel-heading absent"><b>In Class</b></div>
                          {this.getStudentRowsInCurrentClass()}
                        </div>
                      </div>
                      <div className="col-sm-6 column">
                        <div className= { "panel " + panel }>
                          <div className="panel-heading absent"><b>Not In Class</b></div>
                          {this.getStudentRowsNotInCurrentClass()}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
        </div>;
    }
}
