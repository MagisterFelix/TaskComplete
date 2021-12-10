import React from "react";
import "./style.scss";
import { Navbar } from "../navigation/navbar";
import axios from 'axios';
import API from '../../api/links';
import { Modal } from "react-bootstrap";
import profileImage from './profile.svg';

export class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showHide: false,
            username: null,
            formErrors: {
                username: "",
            }
        }
    }

    uploadImage(img) {
        const API_KEY = process.env.REACT_APP_API_KEY;

        let body = new FormData();
        body.set('key', API_KEY);
        body.append('image', img);

        return axios({
            method: 'post',
            url: 'https://api.imgbb.com/1/upload',
            data: body
        })
    }

    handleModalShowHide() {
        this.setState({ showHide: !this.state.showHide })
    }

    handleSubmit = e => {
        e.preventDefault();

        if (e.target[1].files.length) {
            this.uploadImage(e.target[1].files[0])
                .then(response => {
                    axios.put(API.profile, { image: response.data.data.url }, { headers })
                        .then(() => {
                            this.handleModalShowHide();
                        }).catch(error => {
                            console.log(error.response.data);
                        })
                })
        }
        const headers = {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (this.state.username) {
            axios.put(API.profile, { name: this.state.username }, { headers })
                .then(() => {
                    this.handleModalShowHide();
                }).catch(error => {
                    console.log(error.response.data);
                })
        }
        setTimeout(() => { window.location.reload(); }, 2000);
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
            default:
                break;
        }

        this.setState({ formErrors, [name]: value });
    };

    render() {
        const { formErrors } = this.state;

        return (
            <>
                <Navbar />
                <div className="profile">
                    <Modal show={this.state.showHide}>
                        <Modal.Header closeButton onClick={() => this.handleModalShowHide()}>
                            <Modal.Title>Info</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Profile updated successfully!
                        </Modal.Body>
                    </Modal>
                    <div className="wrapper">
                        <div className="row">
                            <div className="col">
                                <div className="header">Profile</div>
                            </div>
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
                                                <input type="text" name="username" id="username" placeholder="Username" onChange={this.handleChange}
                                                    className={formErrors.username.length > 0 ? "error" : null} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="image">Image</label>
                                                <input type="file" name="image" id="image" />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="image">
                                                <img src={profileImage} alt="register_image" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="footer">
                                                <button type="submit" className="button">Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
