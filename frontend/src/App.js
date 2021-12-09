import React from "react";
import "./App.scss";
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from './api/links';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null
    }
  }

  async componentDidMount() {
    const headers = {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    await axios.get(API.profile, { headers })
      .then(response => {
        this.setState({ user: response.data.data })
      })
      .catch(() => {
        this.props.history.push('/login')
      });
  }

  render() {
    if (!this.state.user) {
      return (<></>);
    }
    return (
      <div className="app"></div>
    );
  }
}

export default App;