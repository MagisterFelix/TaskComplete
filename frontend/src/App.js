import React from "react";
import "./App.scss";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import { Navbar } from "./components/navigation/navbar";
import { Main } from "./components/main/mainPage";
import axios from 'axios';
import API from './api/links';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NotFound } from "./components/404/404";
import { Login } from "./components/auth/loginPage";
import { Register } from "./components/auth/registerPage";
import { Profile } from "./components/profile/profilePage";
import { Statistics } from "./components/statistics/statisticsPage";
import { Admin } from "./components/admin/adminPage";
import { User } from "./components/admin/models/user";
import { Task } from "./components/admin/models/task";
import { Subtask } from "./components/admin/models/subtask";
import { Tag } from "./components/admin/models/tag";
import { Extra } from "./components/admin/models/extra";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class App extends React.Component {
  state = {
    user: null,
    info: null
  }

  componentDidMount() {
    const headers = {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    axios.get(API.profile, { headers })
      .then(response => {
        this.setState({ user: response.data.data });
        if (this.state.user.is_staff) {
          axios.get(API.admin, { headers })
            .then(response => {
              this.setState({ info: response.data.data });
            });
        }
      })
      .catch(() => {
        this.setState({ user: 'Unauthorized' });
      });
  }

  render() {
    if (!this.state.user) {
      return (<></>);
    }

    if (this.state.user === 'Unauthorized') {
      return (
        <Router>
          <Switch>
            <Route exact path='/' component={Main} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      );
    }

    if (this.state.user.is_staff) {
      if (!this.state.info) {
        return (<></>);
      }

      return (
        <Router>
          <Navbar user={this.state.user} />
          <Switch>
            <Route exact path='/' component={() => <Main user={this.state.user} />} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/profile' component={() => <Profile user={this.state.user} />} />
            <Route exact path='/statistics' component={Statistics} />
            <Route exact path='/admin' component={() => <Admin info={this.state.info} />} />
            <Route exact path='/admin/users' component={() => <User user={this.state.info.User} />} />
            <Route exact path='/admin/tasks' component={() => <Task task={this.state.info.Task} user={this.state.info.User} />} />
            <Route exact path='/admin/subtasks' component={() => <Subtask subtask={this.state.info.Subtask} task={this.state.info.Task} />} />
            <Route exact path='/admin/tags' component={() => <Tag tag={this.state.info.Tag} task={this.state.info.Task} />} />
            <Route exact path='/admin/extras' component={() => <Extra extra={this.state.info.Extra} task={this.state.info.Task} />} />
            <Route component={NotFound} />
          </Switch>
          <ToastContainer
            position="top-left"
            autoClose={2000}
            style={{ marginTop: "5.5%" }}
          />
          <footer></footer>
        </Router >
      );
    }

    return (
      <Router>
        <Navbar user={this.state.user} />
        <Switch>
          <Route exact path='/' component={() => <Main user={this.state.user} />} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/register' component={Register} />
          <Route exact path='/profile' component={() => <Profile user={this.state.user} />} />
          <Route exact path='/statistics' component={() => <Statistics user={this.state.user} />} />
          <Route component={NotFound} />
        </Switch>
        <ToastContainer
          position="top-left"
          autoClose={2000}
          style={{ marginTop: "5.5%" }}
        />
        <footer></footer>
      </Router >
    );
  }
}
