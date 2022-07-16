import React, { useEffect } from "react";
import "./style.scss";
import axios from 'axios';
import API from '../../api/links';
import 'font-awesome/css/font-awesome.css';
import { Subtask } from "./subtaskPage";
import { Tag } from "./tagPage";
import { Extra } from "./extraPage";
import { Modal } from "react-bootstrap";
import strings from "../../locale/locale";
import { toast } from 'react-toastify';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const languages = {
    'en': 'en-US',
    'uk': 'uk-UA',
    'ru': 'ru-RU'
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const Mircophone = ({ onPostTask, onPutTask, onDeleteTask, onAddToCalendar, onDoneTask, onTranscriptChange }) => {
    const commands = [
        {
            command: [strings.command_create_task_1, strings.command_create_task_2, strings.command_create_task_3],
            callback: (title, date) => onPostTask(title, date)
        },
        {
            command: [strings.command_update_task_1, strings.command_update_task_2, strings.command_update_task_3],
            callback: (oldTitle, newTitle) => onPutTask(oldTitle, newTitle),
        },
        {
            command: [strings.command_delete_task_1, strings.command_delete_task_2],
            callback: (title) => onDeleteTask(title)
        },
        {
            command: strings.command_add_all_tasks_to_calendar,
            callback: () => onAddToCalendar(),
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7
        },
        {
            command: [strings.command_done_task_1, strings.command_done_task_2],
            callback: (title) => onDoneTask(title)
        },
    ]
    const { transcript, listening, resetTranscript } = useSpeechRecognition({ commands });

    useEffect(() => {
        onTranscriptChange(transcript);
    }, [transcript]);

    console.log(transcript)

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return alert("Browser doesn't support speech recognition.");
    }

    return (
        <>
            {
                listening ?
                    <div className="microphone mic-enabled" id="microphone"
                        onClick={() => { SpeechRecognition.stopListening(); resetTranscript() }}><i className="fa fa-microphone"></i></div>
                    :
                    <div className="microphone mic-disabled" id="microphone"
                        onClick={() => SpeechRecognition.startListening({ language: languages[localStorage.getItem("locale")] })}><i className="fa fa-microphone"></i></div>
            }
        </>
    )
}

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
            title: '',
            description: null,
            priority: 0,
            reminder: 0,
            sortDate: 0,
            sortPriority: 0,
            showHideError: false,
            errorMessage: null,
            command: ''
        }

        this._isMounted = false;
        this.onGetCommand = this.onGetCommand.bind(this);
        this.postTask = this.postTask.bind(this);
        this.putTask = this.putTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.addAllToCalendar = this.addAllToCalendar.bind(this);
        this.doneTask = this.doneTask.bind(this);
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
            .catch((response) => {
                if (JSON.parse(JSON.stringify(response)).status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onGetCommand(command) {
        this.setState({ command });
    }

    postTask(title, date) {
        let newDate;
        if (!date || date === strings.tomorrow) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            newDate = tomorrow.toISOString().slice(0, 10);
        } else {
            const preDate = date.includes('.') ? date.split('.') : date.split(' ');
            newDate = new Date(new Date().getFullYear(), parseInt(preDate[1]) - 1, parseInt(preDate[0]) + 1);
            newDate = newDate.toISOString().slice(0, 10)
        }

        const body = {
            date: newDate,
            title: capitalize(title),
            description: '',
            priority: 0,
            reminder: 0
        };

        axios.post(API.tasks, body, { headers })
            .then(() => {
                axios.get(API.tasks, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data });
                        toast.success(strings.notifications_success);
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This task is already exists.";
                }
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
                toast.error(strings.notifications_failure);
            });
    }

    putTask(oldTitle, newTitle) {
        for (const task of this.state.tasks) {
            if (task.title.toLowerCase() === oldTitle.toLowerCase()) {
                const body = {
                    date: task.date,
                    title: capitalize(newTitle),
                    description: task.description,
                    priority: task.priority,
                    reminder: task.reminder
                };

                axios.put(API.task.replace('task_id', task.id), body, { headers })
                    .then(() => {
                        axios.get(API.tasks, { headers })
                            .then(response => {
                                this._isMounted && this.setState({ tasks: response.data.data });
                                toast.success(strings.notifications_success);
                            });
                    })
                    .catch(error => {
                        error = error.response.data.message;
                        if (error.includes("set")) {
                            error = "This task is already exists.";
                        }
                        this.setState({ errorMessage: error });
                        this.handleModalShowHideError();
                        toast.error(strings.notifications_failure);
                    });
                break;
            }
        }
    }

    deleteTask(title) {
        for (const task of this.state.tasks) {
            if (task.title.toLowerCase() === title.toLowerCase()) {
                axios.delete(API.task.replace('task_id', task.id), { headers })
                    .then(() => {
                        axios.get(API.tasks, { headers })
                            .then(response => {
                                this._isMounted && this.setState({ tasks: response.data.data });
                                toast.success(strings.notifications_success);
                            });
                    });
                break;
            }
        }
    }

    doneTask(title) {
        for (const task of this.state.tasks) {
            if (task.title.toLowerCase() === title.toLowerCase()) {
                const body = {
                    done: true
                };
                axios.put(API.task.replace('task_id', task.id), body, { headers })
                    .then(() => {
                        axios.get(API.tasks, { headers })
                            .then(response => {
                                this._isMounted && this.setState({ tasks: response.data.data });
                                toast.success(strings.notifications_success);
                            });
                    });
                break;
            }
        }
    }

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

    addAllToCalendar() {
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

    addEvent(task) {
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

    addToCalendar(task) {
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
                    this.addEvent(task);
                    toast.success(strings.notifications_success);
                } else {
                    authInstance.signIn()
                        .then(() => {
                            this.addEvent(task);
                            toast.success(strings.notifications_success);
                        })
                }
            });
        });
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
                scope: this.SCOPES,
                immediate: false,
                plugin_name: 'taskcomplete'
            });

            this.gapi.client.load('calendar', 'v3');

            let authInstance = this.gapi.auth2.getAuthInstance();
            authInstance.then(() => {
                if (authInstance.isSignedIn.get()) {
                    this.updateEvents(body, prevTitle, prevDate);
                } else {
                    authInstance.signIn()
                        .then(() => {
                            this.updateEvents(body, prevTitle, prevDate);
                        })
                }
            });
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
                scope: this.SCOPES,
                plugin_name: 'taskcomplete'
            });

            this.gapi.client.load('calendar', 'v3');

            let authInstance = this.gapi.auth2.getAuthInstance();
            authInstance.then(() => {
                if (authInstance.isSignedIn.get()) {
                    this.deleteEvents(id);
                } else {
                    authInstance.signIn()
                        .then(() => {
                            this.deleteEvents(id);;
                        })
                }
            });
        });
    }

    handleDone(index, task) {
        let done = document.getElementById('done' + index);
        const body = {
            done: !task.done
        };
        if (!task.done) {
            done.className = 'fa fa-check-square-o fa-3x square mr-1';
            if (this.props.user.premium) {
                this.removeFromCalendar(task.id);
            }
        } else {
            done.className = 'fa fa-square-o fa-3x square mr-1';
            if (this.props.user.premium) {
                this.addToCalendar(task);
            }
        }
        axios.put(API.task.replace('task_id', task.id), body, { headers })
            .then(() => {
                axios.get(API.tasks, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data });
                        if (this.state.tasks.length > 1) {
                            done.className = 'fa fa-square-o fa-3x square mr-1';
                        }
                    });
            });
    }

    handleDeleteSubtask = id => {
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

                        if (this.props.user.premium && body.reminder) {
                            this.addToCalendar(this.state.tasks[this.state.tasks.length - 1]);
                        }
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
            description: (this.state.description !== null) ? this.state.description : this.state.task.description,
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


    handleDeleteTask = id => {
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

        const days = [strings.monday, strings.tuesday, strings.wednesday, strings.thursday, strings.friday, strings.saturday, strings.sunday];
        const months = [strings.january, strings.february, strings.march, strings.april, strings.may, strings.june, strings.july, strings.august, strings.september, strings.october, strings.november, strings.december];

        let tasks = [];
        let sorted_tasks = this.state.tasks;

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
                <div key={task_index} className={"task" + (task.done ? "_done" : "") + " row mt-5"}>
                    <div className="col-12 mx-auto">
                        <div className="row justify-content-between mx-5">
                            <div className="task_UD d-flex justify-content-center align-items-center mx-5 p-3">
                                {this.props.user.premium && <i className="fa fa-calendar-plus-o fa-2x mr-3" onClick={() => this.addToCalendar(task)}></i>}
                                <i className="fa fa-pencil fa-2x mr-2" onClick={() => this.handleModalShowHide(task)}></i>
                                <i className="fa fa-trash fa-2x ml-2" onClick={() => this.handleDeleteTask(task.id)}></i>
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
                                            {
                                                task.done ?
                                                    <i className="fa fa-check-square-o fa-3x square mr-1" id={"done" + task_index} onClick={() => this.handleDone(task_index, task)}></i>
                                                    :
                                                    <i className="fa fa-square-o fa-3x square mr-1" id={"done" + task_index} onClick={() => this.handleDone(task_index, task)}></i>
                                            }
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
                                        <h4 className="desc-header text-center mb-3">{strings.description}</h4>
                                        {task.description.length ? <p className="desc-text text-justify mr-4">{task.description}</p> : <h2 className="text-gray text-center mt-5">{strings.no_desc}</h2>}
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
                        <Modal.Title>{strings.wrong}</Modal.Title>
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
                                            <i className="fa fa-plus-circle pr-2"></i>{strings.new_task}
                                        </h4>
                                    </div>
                                    <div className="row justify-content-start" onClick={() => this.sortByDate()}>
                                        <h4 className="fw-weight-bold m-3 sortDate">
                                            <i className="fa fa-sort mx-1 pr-2"></i>{strings.sort_date}
                                        </h4>
                                    </div>
                                    <div className="row justify-content-start" onClick={() => this.sortByPriority()}>
                                        <h4 className="fw-weight-bold m-3 sortPriority">
                                            <i className="fa fa-sort mx-1 pr-2"></i>{strings.sort_priority}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tasks container">
                    <Modal size="lg" show={this.state.showHide} onEnter={() => { this.updateInput() }}>
                        <Modal.Header closeButton onClick={() => { this.handleModalShowHide(); }}></Modal.Header>
                        <Modal.Body>
                            <form className="form" onSubmit={(this.state.task && this.handleUpdateTask(this.state.task.id)) || this.handleSubmitTask}>
                                <div className="row">
                                    <div className="col-8">
                                        <div className="task-input">
                                            <div className="form-group">
                                                <label htmlFor="date">{strings.date}</label>
                                                <input required={!this.state.task} type="date" min={tomorrow.toISOString().slice(0, 10)} name="date" id="date" placeholder={strings.new_date} onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="title">{strings.title}</label>
                                                <input required={!this.state.task} type="text" name="title" id="title" placeholder={strings.new_title} onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="description">{strings.description}</label>
                                                <textarea type="text" name="description" id="description" cols="30" rows="10" placeholder={strings.new_description} onChange={this.handleChangeTask} />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="priority">{strings.priority}</label>
                                                <select required={!this.state.task} id="priority" name="priority" onChange={this.handleChangeTask}>
                                                    <option value="0">{strings.no_priority}</option>
                                                    <option value="1">{strings.high_priority}</option>
                                                    <option value="2">{strings.medium_priority}</option>
                                                    <option value="3">{strings.low_priority}</option>
                                                </select>
                                            </div>
                                            {
                                                this.props.user.premium &&
                                                <div className="form-group">
                                                    <label htmlFor="reminder">{strings.reminder}</label>
                                                    <select required={!this.state.task} id="reminder" name="reminder" onChange={this.handleChangeTask}>
                                                        <option value="0">{strings.no_reminder}</option>
                                                        <option value="1">{strings.td_reminder}</option>
                                                        <option value="2">{strings.od_reminder}</option>
                                                        <option value="3">{strings.th_reminder}</option>
                                                        <option value="4">{strings.oh_reminder}</option>
                                                    </select>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-4 text-right align-self-end">
                                        <button type="submit" className="button mt-2">{strings.submit}</button>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                    {tasks.length ? tasks : <h2 className="text-gray text-center mt-5">{strings.no_tasks}</h2>}
                </div>
                {this.props.user.premium && <Mircophone
                    onPostTask={this.postTask}
                    onPutTask={this.putTask}
                    onDeleteTask={this.deleteTask}
                    onAddToCalendar={this.addAllToCalendar}
                    onDoneTask={this.doneTask}
                    onTranscriptChange={this.onGetCommand} />}
            </>
        );
    }
}
