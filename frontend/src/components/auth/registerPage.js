import React from "react";
import backgroundImage from "./background.svg";
import { Link } from 'react-router-dom';
import { Modal } from "react-bootstrap";
import axios from 'axios';
import API from '../../api/links';
import registerImage from './register.svg';

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const passwordRegex = RegExp(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
);

const formValid = ({ formErrors, ...rest }) => {
    let valid = true;

    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false);
    });

    Object.entries(rest).forEach(([key, val]) => {
        if (key !== 'showHide' && key !== 'errorMessage') {
            val === null && (valid = false);
        }
    });

    return valid;
};


export class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showHide: false,
            username: null,
            email: null,
            password: null,
            rpassword: null,
            formErrors: {
                username: "",
                email: "",
                password: "",
                rpassword: ""
            },
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

        if (formValid(this.state)) {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            const body = {
                name: this.state.username,
                email: this.state.email,
                password: this.state.password
            };
            await axios.post(API.register, body, { headers })
                .then(() => {
                    delete body.name;
                    axios.post(API.login, body, { headers })
                        .then(response => {
                            localStorage.setItem('token', response.data.token);
                            this.props.history.push('/');
                        });
                })
                .catch(error => {
                    error = error.response.data;
                    this.state.errorMessage = error.message;
                    this.handleModalShowHide();
                });
        }
    }

    handleChange = e => {
        e.preventDefault();
        const { name, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        switch (name) {
            case "username":
                formErrors.username =
                    value.length > 2
                        ? ""
                        : "Invalid username";
                break;
            case "email":
                formErrors.email =
                    emailRegex.test(value)
                        ? ""
                        : "Invalid email";
                break;
            case "password":
                formErrors.password =
                    passwordRegex.test(value)
                        ? ""
                        : "Invalid password";
                break;
            case "rpassword":
                formErrors.rpassword =
                    value === document.getElementById('password').value
                        ? ""
                        : "Mismatch";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [name]: value });
    };

    render() {
        const { formErrors } = this.state;

        return (
            <div className="main" style={{ backgroundImage: "url(" + backgroundImage + ")" }}>
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
                            <div className="header">Register</div>
                        </div>
                        <div className="row">
                            <div className="content">
                                <form className="form" onSubmit={this.handleSubmit}>
                                    <div className="row mx-4 my-3">
                                        <div className="col-6">
                                            <div className="form-group">
                                                <label htmlFor="username">Username
                                                    {formErrors.username.length > 0 && (
                                                        <span className="error">{formErrors.username}</span>
                                                    )}
                                                </label>
                                                <input required type="text" name="username" id="username" placeholder="Username" onChange={this.handleChange}
                                                    className={formErrors.username.length > 0 ? "error" : null} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="email">Email
                                                    {formErrors.email.length > 0 && (
                                                        <span className="error">{formErrors.email}</span>
                                                    )}
                                                </label>
                                                <input required type="email" name="email" id="email" placeholder="Email" onChange={this.handleChange}
                                                    className={formErrors.email.length > 0 ? "error" : null} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Password
                                                    {formErrors.password.length > 0 && (
                                                        <span className="error">{formErrors.password}</span>
                                                    )}
                                                </label>
                                                <input required type="password" name="password" id="password" placeholder="Password" onChange={this.handleChange}
                                                    className={formErrors.password.length > 0 ? "error" : null} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="rpassword">Repeat password
                                                    {formErrors.rpassword.length > 0 && (
                                                        <span className="error">{formErrors.rpassword}</span>
                                                    )}
                                                </label>
                                                <input required type="password" name="rpassword" id="rpassword" placeholder="Password" onChange={this.handleChange}
                                                    className={formErrors.rpassword.length > 0 ? "error" : null} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="image">
                                                <img src={registerImage} alt="register_image" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="footer">
                                            <button type="submit" className="button">Register</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <Link to="/login">
                        <div className="right-side left">
                            <div className="inner-container">
                                <div className="text">
                                    Login
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        )
    }
}