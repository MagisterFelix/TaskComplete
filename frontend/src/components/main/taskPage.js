import React from "react";
import "./style.scss";
import axios from 'axios';
import API from '../../api/links';
import 'font-awesome/css/font-awesome.css';
import { Subtask } from "./subtaskPage";
import { Tag } from "./tagPage";
import { Extra } from "./extraPage";
import { Modal } from "react-bootstrap";

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export default function clearInput() {
    let inputs = document.getElementsByTagName('input');
    for (const input of inputs) {
        input.value = '';
    }
}

export class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showHide: null,
            tasks: null,
            task: null,
            date: null,
            title: null,
            description: null,
            priority: 0,
            reminder: 0,
            sortDate: 0,
            sortPriority: 0,
            showHideError: false,
            errorMessage: null
        }

        this._isMounted = false;
    }

    gapi = window.gapi;

    CLIENT_ID = process.env.REACT_APP_GCCLIENT_ID;
    API_KEY = process.env.REACT_APP_GCAPI_KEY;
    DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    SCOPES = "https://www.googleapis.com/auth/calendar.events";

    componentDidMount() {
        this._isMounted = true;
        axios.get(API.tasks, { headers })
            .then(response => {
                this._isMounted && this.setState({ tasks: response.data.data });
            })
            .catch(() => {
                window.location.href = '/login';
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateEvents(body, prevTitle, prevDate) {
        let min_date = new Date(prevDate);
        min_date.setDate(min_date.getDate() - 1);

        this.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            "singleEvents": true,
            "orderBy": "startTime",
            "timeMin": min_date.toISOString()
        }).execute((response) => {
            const event = response.items.filter((item) => {
                return item.summary === prevTitle;
            })[0];

            if (event) {

                var date = body.date;
                var title = body.title;
                var description = body.description;
                var priority = body.priority;
                var reminder = body.reminder;

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

                event.summary = title;
                event.description = description;
                event.colorId = priority;
                event.start.date = date;
                event.end.date = date;

                if (reminder) {
                    event.reminders.overrides = [
                        {
                            'method': 'email', 'minutes': reminder
                        }
                    ]
                }

                var request = this.gapi.client.calendar.events.patch({
                    'calendarId': 'primary',
                    'eventId': event.id,
                    'resource': event
                });

                request.execute();
            }
        });
    }

    updateInCalendar(body, prevTitle, prevDate) {
        this.gapi.load('client:auth2', () => {

            this.gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: this.DISCOVERY_DOCS,
                scope: this.SCOPES
            });

            this.gapi.client.load('calendar', 'v3');


            if (this.gapi.auth2.getAuthInstance().isSignedIn.get()) {
                this.updateEvents(body, prevTitle, prevDate);
            } else {
                this.gapi.auth2.getAuthInstance().signIn()
                    .then(() => {
                        this.updateEvents(body, prevTitle, prevDate);
                    })
            }
        });
    }

    deleteEvents(id) {
        axios.get(API.task.replace('task_id', id), { headers })
            .then((task) => {
                let min_date = new Date(task.data.data.date);
                min_date.setDate(min_date.getDate() - 1);

                this.gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    "singleEvents": true,
                    "orderBy": "startTime",
                    "timeMin": min_date.toISOString()
                }).execute((response) => {
                    const event = response.items.filter((task) => {
                        return this.state.tasks.some((item) => {
                            return item.summary === task.title;
                        });
                    })[0];

                    if (event) {
                        var request = this.gapi.client.calendar.events.delete({
                            'calendarId': 'primary',
                            'eventId': event.id
                        });

                        request.execute();
                    }
                });
            })
    }

    removeFromCalendar(id) {
        this.gapi.load('client:auth2', () => {

            this.gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: this.DISCOVERY_DOCS,
                scope: this.SCOPES
            });

            this.gapi.client.load('calendar', 'v3');


            if (this.gapi.auth2.getAuthInstance().isSignedIn.get()) {
                this.deleteEvents(id);
            } else {
                this.gapi.auth2.getAuthInstance().signIn()
                    .then(() => {
                        this.deleteEvents(id);
                    })
            }
        });
    }

    handleDone(index, id) {
        let done = document.getElementById('done' + index);
        done.className = 'fa fa-check-square-o fa-3x done';
        const body = {
            done: true
        };
        if (this.props.user.premium) {
            this.removeFromCalendar(id);
        }
        axios.put(API.task.replace('task_id', id), body, { headers });
    }

    delete(id) {
        if (this.props.user.premium) {
            this.removeFromCalendar(id);
        }
        axios.delete(API.task.replace('task_id', id), { headers })
            .then(() => {
                axios.get(API.tasks, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data });
                    });
            });
    }

    handleModalShowHide(task) {
        this.setState({ task: task, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    over(index) {
        let addTag = document.getElementById('addTag' + index);
        if (addTag) {
            addTag.className = 'addTagHover';
        }
    };

    out(index) {
        let addTag = document.getElementById('addTag' + index);
        if (addTag) {
            addTag.className = 'addTag';
        }
    };

    handleSubmitTask = e => {
        e.preventDefault();

        const body = {
            date: this.state.date,
            title: this.state.title,
            description: this.state.description,
            priority: parseInt(this.state.priority),
            reminder: parseInt(this.state.reminder)
        };

        axios.post(API.tasks, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.tasks, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This task is already exists.";
                }
                this.handleModalShowHide();
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    };

    handleUpdateTask = id => e => {
        e.preventDefault();

        const body = {
            date: this.state.date ? this.state.date : this.state.task.date,
            title: this.state.title ? this.state.title : this.state.task.title,
            description: this.state.description ? this.state.description : this.state.task.description,
            priority: this.state.priority ? parseInt(this.state.priority) : this.state.task.priority,
            reminder: this.state.reminder ? parseInt(this.state.reminder) : this.state.task.reminder
        };

        const title = this.state.task.title;
        const date = this.state.task.date;

        axios.put(API.task.replace('task_id', id), body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.tasks, { headers })
                    .then(response => {
                        if (this.props.user.premium) {
                            this.updateInCalendar(body, title, date);
                        }
                        this._isMounted && this.setState({ tasks: response.data.data });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This task is already exists.";
                }
                this.handleModalShowHide();
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    };

    handleChangeTask = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    updateInput() {
        if (this.state.task) {
            let date = document.getElementById('date');
            let title = document.getElementById('title');
            let description = document.getElementById('description');
            let priority = document.getElementById('priority');
            let reminder = document.getElementById('reminder');

            date.value = this.state.task.date;
            title.value = this.state.task.title;
            description.value = this.state.task.description;
            priority.value = this.state.task.priority;

            if (this.props.user.premium) {
                reminder.value = this.state.task.reminder;
            }
        }
    }

    sortByDate() {
        this.setState({ sortPriority: 0 })
        this.setState({ sortDate: !(this.state.sortDate - 1) + 1 })
    }

    sortByPriority() {
        this.setState({ sortDate: 0 })
        this.setState({ sortPriority: !(this.state.sortPriority - 1) + 1 })
    }

    render() {
        if (!this.state.tasks) {
            return (<></>);
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let tasks = [];
        let sorted_tasks = this.state.tasks.sort((a, b) => a.id - b.id);

        if (this.state.sortPriority === 1) {
            sorted_tasks = this.state.tasks.sort((a, b) => b.priority - a.priority);
        } else if (this.state.sortPriority === 2) {
            sorted_tasks = this.state.tasks.sort((a, b) => a.priority - b.priority);
        }

        if (this.state.sortDate === 1) {
            sorted_tasks = this.state.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (this.state.sortDate === 2) {
            sorted_tasks = this.state.tasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        for (const [task_index, task] of sorted_tasks.entries()) {
            const date = new Date(task.date);

            let priority = []
            if (task.priority) {
                for (let i = 0; i < 4 - task.priority; ++i) {
                    priority.push(<i key={i} className="fa fa-exclamation-triangle fa-2x my-3 mx-1 pt-1"></i>);
                }
            }

            tasks.push(
                <div key={task_index} className="row mt-5">
                    <div className="col-12 mx-auto">
                        <div className="row justify-content-between mx-5">
                            <div className="task_UD d-flex justify-content-center align-items-center mx-5 p-3">
                                <i className="fa fa-pencil fa-2x mr-2" onClick={() => this.handleModalShowHide(task)}></i>
                                <i className="fa fa-trash fa-2x ml-2" onClick={() => this.delete(task.id)}></i>
                            </div>
                            {
                                priority.length ?
                                    <div className="priority d-flex justify-content-center mx-5">
                                        {priority}
                                    </div>
                                    : <></>
                            }
                        </div>
                        <div className="card border-0 position-relative">
                            <div className="card-body p-5">
                                <div className="header row border-bottom mb-4">
                                    <div className="col-9">
                                        <div className="d-flex mb-5 pb-5 align-items-center" onMouseOver={() => this.over(task.id)} onMouseOut={() => this.out(task.id)}>
                                            <i className="fa fa-square-o fa-3x done mr-1" id={"done" + task_index} onClick={() => this.handleDone(task_index, task.id)}></i>
                                            <div className="ms-3">
                                                <h4 className="fw-weight-bold mb-0 pl-1">{task.title}</h4>
                                            </div>
                                            <Tag task={task.id} />
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="d-flex justify-content-end mb-4 pb-4">
                                            <div className="ms-3">
                                                <h4 className="text-uppercase fw-weight-bold mb-0 text-right">{days[date.getDay()]}</h4>
                                                <p className="text-gray fst-italic mb-0">{date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()}</p>
                                            </div>
                                            <i className="fa fa-calendar fa-3x pl-4"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="body row">
                                    <div className="col-6 border-right">
                                        <h4 className="desc-header text-center mb-3">Description</h4>
                                        {task.description.length ? <p className="desc-text text-justify mr-4">{task.description}</p> : <h2 className="text-gray text-center mt-5">No Description</h2>}
                                    </div>
                                    <div className="col-6 border-left">
                                        <Subtask task={task.id} />
                                    </div>
                                </div>
                                <div className="footer row mt-4">
                                    <div className="col-12 border-top">
                                        <Extra task={task.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <>
                <Modal show={this.state.showHideError}>
                    <Modal.Header closeButton onClick={() => this.handleModalShowHideError()}>
                        <Modal.Title>Something wrong...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.errorMessage}
                    </Modal.Body>
                </Modal>
                <div className="sideBox">
                    <div className="card border-0 position-relative">
                        <div className="card-body p-5">
                            <div className="body row">
                                <div className="col-12">
                                    <div className="row justify-content-start" onClick={() => this.handleModalShowHide()}>
                                        <h4 className="fw-weight-bold m-3 addTask">
                                            <i className="fa fa-plus-circle pr-2"></i>New task
                                        </h4>
                                    </div>
                                    <div className="row justify-content-start" onClick={() => this.sortByDate()}>
                                        <h4 className="fw-weight-bold m-3 sortDate">
                                            <i className="fa fa-sort mx-1 pr-2"></i>Sort by date
                                        </h4>
                                    </div>
                                    <div className="row justify-content-start" onClick={() => this.sortByPriority()}>
                                        <h4 className="fw-weight-bold m-3 sortPriority">
                                            <i className="fa fa-sort mx-1 pr-2"></i>Sort by priority
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tasks container">
                    <Modal size="lg" show={this.state.showHide} onEnter={() => { this.updateInput() }}>
                        <Modal.Header closeButton onClick={() => { this.handleModalShowHide(); }}>
                            <Modal.Title>Updating</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form className="form" onSubmit={(this.state.task && this.handleUpdateTask(this.state.task.id)) || this.handleSubmitTask}>
                                <div className="row">
                                    <div className="col-8">
                                        <div className="task-input">
                                            <div className="form-group">
                                                <label htmlFor="date">Date</label>
                                                <input required={!this.state.task} type="date" min={tomorrow.toISOString().slice(0, 10)} name="date" id="date" placeholder="New date..." onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="title">Title</label>
                                                <input required={!this.state.task} type="text" name="title" id="title" placeholder="New title..." onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="description">Description</label>
                                                <textarea required={!this.state.task} type="text" name="description" id="description" cols="30" rows="10" placeholder="New description..." onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="priority">Priority</label>
                                                <select required={!this.state.task} id="priority" name="priority" onChange={this.handleChangeTask}>
                                                    <option value="0">No priority</option>
                                                    <option value="1">High priority</option>
                                                    <option value="2">Medium priority</option>
                                                    <option value="3">Low priority</option>
                                                </select>
                                            </div>
                                            {
                                                this.props.user.premium &&
                                                <div className="form-group">
                                                    <label htmlFor="reminder">Reminder</label>
                                                    <select required={!this.state.task} id="reminder" name="reminder" onChange={this.handleChangeTask}>
                                                        <option value="0">No reminder</option>
                                                        <option value="1">Warn three days before the end</option>
                                                        <option value="2">Warn one day before the end</option>
                                                        <option value="3">Warn three hours before the end</option>
                                                        <option value="4">Warn one hour before the end</option>
                                                    </select>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-4 text-right align-self-end">
                                        <button type="submit" className="button mt-2">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                    {tasks.length ? tasks : <h2 className="text-gray text-center mt-5">No tasks</h2>}
                </div>
            </>
        );
    }
}
