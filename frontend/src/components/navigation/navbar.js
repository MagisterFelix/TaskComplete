import React from "react";
import logo from './logo.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from '../../api/links';
import './style.scss';

export class Navbar extends React.Component {
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
            <nav className="navbar navbar-expand-sm shadow p-3 mb-5 bg-white w-100">
                <Link to={'/'} className="navbar-brand">
                    <img src={logo} width="50" height="50" alt="logo" />
                    <div className="logo">TaskComplete</div>
                </Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-list-4" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse d-flex justify-content-end" id="navbar-list-4">
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <div className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <div className="username">{this.state.user.name}</div>
                                <img src={this.state.user.image} width="50" height="50" className="rounded-circle" alt="user_image" />
                            </div>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <Link to={'/profile'} className="dropdown-item">Edit Profile</Link>
                                <Link to={'/login'} className="dropdown-item" onClick={() => localStorage.removeItem('token')}>Logout</Link>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}
