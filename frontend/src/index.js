import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import { NotFound } from "./components/404/404";
import { Login } from "./components/auth/loginPage";
import { Register } from "./components/auth/registerPage";
import { Profile } from "./components/profile/profilePage";

const routing = (
  <Router>
    <Switch>
      <Route exact path='/' component={App} />
      <Route path='/login' component={Login} />
      <Route path='/register' component={Register} />
      <Route path='/profile' component={Profile} />
      <Route component={NotFound} />
    </Switch>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'));
