import React from "react";
import "./App.scss";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import { Navbar } from "./components/navigation/navbar";

class App extends React.Component {
  render() {
    return (
      <div className="main-container">
        <Navbar />
        <div className="main"></div>
      </div>
    );
  }
}

export default App;