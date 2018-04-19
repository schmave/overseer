var React = require('react'),
  Modal = require('./modal.jsx'),
  actionCreator = require('./studentactioncreator'),
  studentStore = require('./StudentStore'),
  Router = require('react-router'),
  Link = Router.Link,
  userStore = require('./userstore'),
  SuperItem = require('./superwrapper.jsx');

class Administration extends React.Component {
    static contextTypes = {
        router: React.PropTypes.func
    };

    state = {schools: userStore.getSchools(),
            users: userStore.getUsers(),
            selectedSchool: userStore.getSelectedSchool()};

    componentDidMount() {
        userStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        userStore.removeChangeListener(this._onChange);
    }

    selectSchool = (s) => {
        userStore.setSuperSchool(s);
        this.setState({selectedSchool:s});
    };

    makeItems = () => {
        var that = this;
        return this.state.schools.map(function(school){
            return (<li><a onClick={that.selectSchool.bind(that,school)}>
                     {school.name}</a></li>);
        });
    };

    makeDropDown = () => {
        return (<div className="dropdown">
            <button className="btn btn-default dropdown-toggle"
            type="button" id="dropdownMenu1"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            {this.state.selectedSchool?this.state.selectedSchool.name:""}
                <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
            {this.makeItems()}
        </ul>
      </div>);
    };

    makeUser = () => {
        actionCreator.makeUser(this.state.username, this.state.password);
        this.setState({username: "", password:""});
    };

    handleUsernameChange = (event) => {
        this.setState({username: event.target.value});
    };

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    };

    drawUsers = () => {
        var users = this.state.users;
        users = users.groupBy(u=>u.schema_name);
        if (Object.keys(users).length !== 0) {
          return Object.keys(users).map(function(k){
              var userGroup = users[k];
              return <div>
                <h4>{ k }</h4>
                { userGroup.map(function(user){ return <div>{ user.username }</div>;}) }
              </div>
          });
        }
    };

    render() {
        return <SuperItem>
            <div>Administration
                {this.state.selectedSchool?this.state.selectedSchool.name:""}
                {this.makeDropDown()}
                <div>
                    <h2>Make User</h2>
                    <form className="navbar-form navbar-left" role="search">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="input-group">
                                    <input type="text"
                                           className="form-control"
                                           placeholder="Username"
                                           value={this.state.username}
                                           onChange={this.handleUsernameChange}
                                           aria-describedby="username">
                                    </input>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="input-group">
                                    <input type="text"
                                           className="form-control"
                                           value={this.state.password}
                                           onChange={this.handlePasswordChange}
                                           placeholder="Password"
                                           aria-describedby="password">
                                    </input>
                                    <button type="button"
                                            onClick={this.makeUser.bind(this)}
                                            className="btn btn-default"
                                            aria-label="Left Align">
                                        <span className="glyphicon glyphicon-save" aria-hidden="true"></span>
                                        Create
                                    </button>
                                </div>
                            </div>
                            {this.drawUsers()}
                        </div>
                    </form>
                </div>
            </div>
            </SuperItem>
    }

    _onChange = () => {
        this.setState({schools: userStore.getSchools(),
                       users: userStore.getUsers(),
                       selectedSchool: userStore.getSelectedSchool()});
    };
}

module.exports = Administration;
