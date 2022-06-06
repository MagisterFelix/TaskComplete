import React from "react";
import logo from './logo.svg';
import axios from 'axios';
import API from '../../api/links';
import { Link } from 'react-router-dom';
import './style.scss';
import strings from "../../locale/locale";
import { toast } from 'react-toastify';

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Navbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tasks: null,
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get(API.tasks, { headers })
            .then(response => {
                this._isMounted && this.setState({ tasks: response.data.data });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    gapi = window.gapi;

    CLIENT_ID = process.env.REACT_APP_GCCLIENT_ID;
    API_KEY = process.env.REACT_APP_GCAPI_KEY;
    DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    SCOPES = "https://www.googleapis.com/auth/calendar.events";

    sendEvents() {
        axios.get(API.tasks, { headers })
            .then(response => {
                this.setState({ tasks: response.data.data });
            });

        let sorted = this.state.tasks.sort(function (a, b) {
            var date1 = (new Date(a.date));
            var date2 = (new Date(b.date));
            return date1 - date2;
        });

        let min_date = new Date(sorted[0].date);
        min_date.setDate(min_date.getDate() - 1);

        this.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            "singleEvents": true,
            "orderBy": "startTime",
            "timeMin": min_date.toISOString(),
        }).execute((response) => {
            const filtered = this.state.tasks.filter((task) => {
                return response.items.every((item) => {
                    return item.summary !== task.title;
                });
            });

            for (const task of filtered) {

                var priority = task.priority;
                var reminder = task.reminder;

                if (reminder === 1) {
                    reminder = 24 * 60 * 3;
                } else if (reminder === 2) {
                    reminder = 24 * 60;
                } else if (reminder === 3) {
                    reminder = 60 * 3;
                } else if (reminder === 4) {
                    reminder = 60;
                } else {
                    reminder = 0;
                }

                if (priority === 1) {
                    priority = 11;
                } else if (priority === 2) {
                    priority = 5;
                } else if (priority === 3) {
                    priority = 2;
                } else {
                    priority = 8;
                }

                var event;

                if (reminder) {
                    event = {
                        'summary': task.title,
                        'description': task.description,
                        'colorId': priority,
                        'start': {
                            'date': task.date
                        },
                        'end': {
                            'date': task.date
                        },
                        'reminders': {
                            'useDefault': false,
                            'overrides': [
                                { 'method': 'email', 'minutes': reminder }
                            ]
                        }
                    };
                } else {
                    event = {
                        'summary': task.title,
                        'description': task.description,
                        'colorId': priority,
                        'start': {
                            'date': task.date
                        },
                        'end': {
                            'date': task.date
                        },
                        'reminders': {
                            'useDefault': false
                        }
                    };
                }

                var request = this.gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event
                });

                request.execute();
            }
        });
    }

    handleClick = () => {
        this.gapi.load('client:auth2', () => {

            this.gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: this.DISCOVERY_DOCS,
                scope: this.SCOPES,
                plugin_name: 'taskcomplete'
            });

            this.gapi.client.load('calendar', 'v3');

            let authInstance = this.gapi.auth2.getAuthInstance();
            authInstance.then(() => {
                if (authInstance.isSignedIn.get()) {
                    this.sendEvents();
                    toast.success(strings.notifications_success);
                } else {
                    authInstance.signIn()
                        .then(() => {
                            this.sendEvents();
                            toast.success(strings.notifications_success);
                        })
                }
            });
        });
    }

    logout() {
        this.gapi.load('client:auth2', () => {

            this.gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: this.DISCOVERY_DOCS,
                scope: this.SCOPES,
                plugin_name: 'taskcomplete'
            });

            let authInstance = this.gapi.auth2.getAuthInstance();
            authInstance.then(() => {
                if (authInstance.isSignedIn.get()) {
                    authInstance.signOut()
                }
            });
        });
    }

    render() {
        return (
            <nav className="navbar navbar-expand-sm fixed-top shadow p-3 mb-5 bg-white w-100">
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
                                <div className="username">{this.props.user.name}</div>
                                <img src={this.props.user.image} width="50" height="50" className="rounded-circle" alt="user_image" />
                            </div>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                {this.props.user.premium && <button className="dropdown-item" onClick={this.handleClick}>{strings.add_all_to_calendar}</button>}
                                <Link to={'/profile'} className="dropdown-item">{strings.profile}</Link>
                                <Link to={'/login'} className="dropdown-item" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; this.logout(); }}>{strings.logout}</Link>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav >
        );
    }
}
