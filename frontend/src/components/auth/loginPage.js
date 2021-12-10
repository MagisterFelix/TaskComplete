import React from "react";
import loginImage from './login.svg';
import backgroundImage from "./background.svg";
import { Link } from 'react-router-dom'
import { Modal } from "react-bootstrap";
import axios from 'axios';
import API from '../../api/links';
import "./style.scss";

export class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showHide: false,
            email: null,
            password: null,
            errorMessage: null
        }
    }

    componentDidMount() {
        if (localStorage.getItem('token')) {
            this.props.history.push('/');
        }
    }

    handleModalShowHide() {
        this.setState({ showHide: !this.state.showHide })
    }

    handleSubmit = async e => {
        e.preventDefault();

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        const body = {
            email: this.state.email,
            password: this.state.password
        };
        await axios.post(API.login, body, { headers })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                this.props.history.push('/');
            })
            .catch(error => {
                error = error.response.data;
                this.state.errorMessage = error.message;
                this.handleModalShowHide();
            });
    }

    handleChange = e => {
        e.preventDefault();
        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    render() {
        return (
            <div className="auth-container" style={{ backgroundImage: "url(" + backgroundImage + ")" }} >
                <div className="auth">
                    <Modal show={this.state.showHide}>
                        <Modal.Header closeButton onClick={() => this.handleModalShowHide()}>
                            <Modal.Title>Something wrong...</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.errorMessage}
                        </Modal.Body>
                    </Modal>
                    <div className="wrapper">
                        <div className="row">
                            <div className="col">
                                <div className="header">Login</div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="content">
                                <form className="form" onSubmit={this.handleSubmit}>
                                    <div className="row mx-4 my-3">
                                        <div className="col-6">
                                            <div className="form-group">
                                                <label htmlFor="email">Email</label>
                                                <input required type="email" name="email" id="email" placeholder="email" onChange={this.handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Password</label>
                                                <input required type="password" name="password" id="password" placeholder="password" onChange={this.handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="image">
                                                <img src={loginImage} alt="login_image" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="footer">
                                                <button type="submit" className="button">Login</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <Link to="/register">
                        <div className="right-side right">
                            <div className="inner-container">
                                <div className="text">
                                    Register
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div >
        )
    }
}