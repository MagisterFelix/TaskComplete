import React from "react";
import "../style.scss";
import { Modal } from "react-bootstrap";
import axios from 'axios';
import API from '../../../api/links';
import strings from "../../../locale/locale";

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const PRIORITY = {
    0: strings.no_priority,
    1: strings.high_priority,
    2: strings.medium_priority,
    3: strings.low_priority
};

const REMINDER = {
    0: strings.no_reminder,
    1: strings.td_reminder,
    2: strings.od_reminder,
    3: strings.th_reminder,
    4: strings.oh_reminder
};

export class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            model: "task",
            users: this.props.user,
            tasks: this.props.task,
            task: null,
            date: null,
            owner: this.props.user[0].id,
            title: '',
            description: null,
            priority: 0,
            reminder: 0,
            done: null,
            showHide: null,
            showHideError: false,
            errorMessage: null,
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleModalShowHide(task) {
        this.setState({ task: task, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    handleDeleteTask = id => {
        let body = {
            model: this.state.model,
            id: id
        };

        axios.delete(API.admin, { headers: headers, data: body })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data.Task });
                    });
            });
    }

    handleSubmitTask = e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            date: this.state.date,
            owner: parseInt(this.state.owner),
            title: this.state.title,
            description: this.state.description,
            priority: parseInt(this.state.priority),
            reminder: parseInt(this.state.reminder),
            done: this.state.done
        };

        axios.post(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data.Task });
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
            model: this.state.model,
            id: id,
            date: this.state.date ? this.state.date : this.state.task.date,
            owner: this.state.owner ? parseInt(this.state.owner) : this.state.task.owner_id,
            title: this.state.title ? this.state.title : this.state.task.title,
            description: (this.state.description !== null) ? this.state.description : this.state.task.description,
            priority: this.state.priority ? parseInt(this.state.priority) : this.state.task.priority,
            reminder: this.state.reminder ? parseInt(this.state.reminder) : this.state.task.reminder,
            done: (this.state.done !== null) ? this.state.done : this.state.task.done
        };

        axios.put(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tasks: response.data.data.Task });
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

        const { name, value, checked } = e.target;

        if (name == 'done') {
            this.setState({ [name]: checked });
        } else {
            this.setState({ [name]: value });
        }
    };

    updateInput() {
        if (this.state.task) {
            let date = document.getElementById('date');
            let owner = document.getElementById('owner');
            let title = document.getElementById('title');
            let description = document.getElementById('description');
            let priority = document.getElementById('priority');
            let reminder = document.getElementById('reminder');
            let done = document.getElementById('done');

            date.value = this.state.task.date;
            owner.value = this.state.task.owner_id;
            title.value = this.state.task.title;
            description.value = this.state.task.description;
            priority.value = this.state.task.priority;
            reminder.value = this.state.task.reminder;
            done.checked = this.state.task.done;
        }
    }

    render() {
        if (!this.state.tasks) {
            return <></>
        }

        const options = [];
        for (const [object_index, object] of this.state.users.entries()) {
            options.push(
                <option key={object_index} value={object.id}>{object.email}</option>
            )
        }

        const objects = [];
        for (const [object_index, object] of this.state.tasks.entries()) {
            objects.push(
                <div key={object_index} className="row" onClick={() => this.handleModalShowHide(object)}>
                    <div className="cell text-center">
                        {object.id}
                    </div>
                    <div className="cell">
                        {object.date}
                    </div>
                    <div className="cell">
                        {object.owner_name}
                    </div>
                    <div className="cell">
                        {object.title}
                    </div>
                    <div className="cell">
                        {object.description}
                    </div>
                    <div className="cell">
                        {PRIORITY[object.priority]}
                    </div>
                    <div className="cell">
                        {REMINDER[object.reminder]}
                    </div>
                    <div className="cell text-center">
                        {object.done ?
                            <i className="fa fa-check-circle fa-lg" style={{ "color": "green" }}></i>
                            :
                            <i className="fa fa-times-circle fa-lg" style={{ "color": "red" }}></i>}
                    </div>
                </ div >
            )
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return (
            <div className="admin" style={{ 'overflow': 'hidden' }}>
                <Modal show={this.state.showHideError}>
                    <Modal.Header closeButton onClick={() => this.handleModalShowHideError()}>
                        <Modal.Title>Something wrong...</Modal.Title>
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
                        <form className="form" onSubmit={(this.state.task && this.handleUpdateTask(this.state.task.id)) || this.handleSubmitTask}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="task-input">
                                        <div className="form-group">
                                            <label htmlFor="date">{strings.date}</label>
                                            <input required={!this.state.task} type="date" min={tomorrow.toISOString().slice(0, 10)} name="date" id="date" placeholder="New date..." onChange={this.handleChangeTask} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="owner">{strings.owner}</label>
                                            <select required={!this.state.task} id="owner" name="owner" onChange={this.handleChangeTask}>
                                                {options}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="title">{strings.title}</label>
                                            <input required={!this.state.task} type="text" name="title" id="title" placeholder={strings.new_title} onChange={this.handleChangeTask} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="description">{strings.description}</label>
                                            <textarea type="text" name="description" id="description" cols="30" rows="4" placeholder={strings.new_description} onChange={this.handleChangeTask} />
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
                                        <div className="form-group d-flex">
                                            <label className="d-flex justify-content-start" htmlFor="done">{strings.done}</label>
                                            <input className="col-1 d-flex" type="checkbox" id="done" name="done" defaultChecked={this.state.task && this.state.task.done} onChange={this.handleChangeTask} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 d-flex justify-content-end align-self-end mt-5">
                                    {this.state.task && <button type="button" className="button_delete mt-2" onClick={() => this.handleDeleteTask(this.state.task.id)}>{strings.delete}</button>}
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
                                    <div className="cell text-center">
                                        ID
                                    </div>
                                    <div className="cell">
                                        Date
                                    </div>
                                    <div className="cell">
                                        Owner
                                    </div>
                                    <div className="cell">
                                        Title
                                    </div>
                                    <div className="cell">
                                        Description
                                    </div>
                                    <div className="cell">
                                        Priority
                                    </div>
                                    <div className="cell">
                                        Reminder
                                    </div>
                                    <div className="cell">
                                        Done
                                    </div>
                                </div>
                                {objects}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}
