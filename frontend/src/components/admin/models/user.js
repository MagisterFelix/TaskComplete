import React from "react";
import ".././style.scss";
import axios from 'axios';
import API from '../../../api/links';
import strings from "../../../locale/locale";
import { Modal } from "react-bootstrap";

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class User extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            model: "user",
            users: this.props.user,
            showHide: null,
            user: null,
            email: '',
            password: '',
            name: null,
            image: '',
            premium: null,
            is_staff: null,
            showHideError: false,
            errorMessage: null
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleModalShowHide(user) {
        this.setState({ user: user, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    handleDeleteUser = id => {
        let body = {
            model: this.state.model,
            id: id
        };

        axios.delete(API.admin, { headers: headers, data: body })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ users: response.data.data.User });
                    });
            });
    }

    handleSubmitUser = e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            email: this.state.email,
            password: this.state.password,
            is_staff: this.state.is_staff
        };

        axios.post(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ users: response.data.data.User });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This user is already exists.";
                }
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    }

    handleUpdateUser = id => e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            id: id,
            email: this.state.email ? this.state.email : this.state.user.email,
            name: (this.state.name !== null) ? this.state.name : this.state.user.name,
            image: this.state.image ? this.state.image : this.state.user.image,
            premium: (this.state.premium !== null) ? this.state.premium : this.state.user.premium,
            is_staff: (this.state.is_staff !== null) ? this.state.is_staff : this.state.user.is_staff
        };

        axios.put(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ users: response.data.data.User });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This user is already exists.";
                }
                this.handleModalShowHide();
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    }

    handleChangeUser = e => {
        e.preventDefault();

        const { name, value, checked } = e.target;

        if (name == 'is_staff') {
            this.setState({ [name]: checked });
        } else {
            this.setState({ [name]: value });
        }
    }

    updateInput() {
        if (this.state.user) {
            let email = document.getElementById('email');
            let is_staff = document.getElementById('is_staff');
            let name = document.getElementById('name');
            let image = document.getElementById('image');
            let premium = document.getElementById('premium');

            email.value = this.state.user.email;
            is_staff.value = this.state.user.is_staff;
            name.value = this.state.user.name;
            image.value = this.state.user.image;
            premium.value = this.state.user.premium;
        }
    }

    render() {
        if (!this.state.users) {
            return <></>
        }

        const objects = []
        for (const [object_index, object] of this.state.users.entries()) {
            objects.push(
                <div key={object_index} className="row" onClick={() => this.handleModalShowHide(object)}>
                    <div className="cell text-center">
                        {object.id}
                    </div>
                    <div className="cell">
                        {object.email}
                    </div>
                    <div className="cell">
                        {object.name}
                    </div>
                    <div className="cell text-center">
                        <img src={object.image} width={64} height={64}></img>
                    </div>
                    <div className="cell text-center">
                        {object.premium ?
                            <i className="fa fa-check-circle fa-lg" style={{ "color": "green" }}></i>
                            :
                            <i className="fa fa-times-circle fa-lg" style={{ "color": "red" }}></i>}
                    </div>
                    <div className="cell text-center">
                        {object.is_staff ?
                            <i className="fa fa-check-circle fa-lg" style={{ "color": "green" }}></i>
                            :
                            <i className="fa fa-times-circle fa-lg" style={{ "color": "red" }}></i>}
                    </div>
                </div >
            )
        }

        return (
            <div className="admin" style={{ 'overflow': 'hidden' }}>
                <Modal show={this.state.showHideError}>
                    <Modal.Header closeButton onClick={() => this.handleModalShowHideError()}>
                        <Modal.Title>{strings.wrong}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.errorMessage}
                    </Modal.Body>
                </Modal>
                <div className="container add_object mt-5">
                    <button type="button" className="button_additional" onClick={() => this.handleModalShowHide()}>{strings.add_object}</button>
                </div>
                <Modal size="lg" show={this.state.showHide} onEnter={() => { this.updateInput() }}>
                    <Modal.Header closeButton onClick={() => { this.handleModalShowHide(); }}></Modal.Header>
                    <Modal.Body>
                        <form className="form" onSubmit={(this.state.user && this.handleUpdateUser(this.state.user.id)) || this.handleSubmitUser}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="user-input">
                                        <div className="form-group">
                                            <label htmlFor="email">{strings.email}</label>
                                            <input required type="text" name="email" id="email" placeholder={strings.new_email} onChange={this.handleChangeUser} />
                                        </div>
                                        {!this.state.user &&
                                            <div className="form-group">
                                                <label htmlFor="password">{strings.password}</label>
                                                <input required type="password" name="password" id="password" placeholder={strings.new_password} onChange={this.handleChangeUser} />
                                            </div>
                                        }
                                        {this.state.user &&
                                            <div className="form-group">
                                                <label htmlFor="name">{strings.username}</label>
                                                <input type="text" name="name" id="name" placeholder={strings.username} onChange={this.handleChangeUser} />
                                            </div>
                                        }
                                        {this.state.user &&
                                            <div className="form-group">
                                                <label htmlFor="image">{strings.image}</label>
                                                <input type="text" name="image" id="image" placeholder={strings.new_image} onChange={this.handleChangeUser} />
                                            </div>
                                        }
                                        {this.state.user &&
                                            <div className="form-group">
                                                <label htmlFor="premium">{strings.premium.substring(0, 7)}</label>
                                                <input type="text" name="premium" id="premium" placeholder={strings.premium} onChange={this.handleChangeUser} />
                                            </div>
                                        }
                                        <div className="form-group d-flex">
                                            <label className="d-flex justify-content-start" htmlFor="is_staff">{strings.staff}</label>
                                            <input className="col-1 d-flex" type="checkbox" id="is_staff" name="is_staff" defaultChecked={this.state.user && this.state.user.is_staff} onChange={this.handleChangeUser} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 d-flex justify-content-end align-self-end mt-5">
                                    {this.state.user && <button type="button" className="button_delete mt-2" onClick={() => this.handleDeleteUser(this.state.user.id)}>{strings.delete}</button>}
                                    <button type="submit" className="button mt-2 ml-4">{strings.submit}</button>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
                <div className="limiter">
                    <div className="container-table100">
                        <div className="wrap-table100">
                            <div className="table">
                                <div className="row header">
                                    <div className="cell text-center" style={{ "width": "5%" }}>
                                        ID
                                    </div>
                                    <div className="cell">
                                        Email
                                    </div>
                                    <div className="cell">
                                        Name
                                    </div>
                                    <div className="cell text-center" style={{ "width": "5%" }}>
                                        Image
                                    </div>
                                    <div className="cell text-center" style={{ "width": "5%" }}>
                                        Premium
                                    </div>
                                    <div className="cell text-center" style={{ "width": "5%" }}>
                                        Staff
                                    </div>
                                </div>
                                {objects}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
