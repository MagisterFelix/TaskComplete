import React from "react";
import axios from 'axios';
import API from '../../api/links';
import { Modal } from "react-bootstrap";
import clearInput from "./taskPage";

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Subtask extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subtasks: null,
            showHide: null,
            input_subtask: null,
            add_subtask: null,
            subtask: null,
            showHideError: false,
            errorMessage: null
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
            .then(response => {
                this._isMounted && this.setState({ subtasks: response.data.data });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    componentDidUpdate(prevPros) {
        if (prevPros.task !== this.props.task) {
            axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
                .then(response => {
                    this._isMounted && this.setState({ subtasks: response.data.data });
                });
        }
    }


    handleModalShowHide(subtask) {
        this.setState({ subtask: subtask, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    over(index) {
        let subtask_box = document.getElementById('subtask_box' + index);
        subtask_box.className = 'subtask_boxHover';
    }

    out(index) {
        let subtask_box = document.getElementById('subtask_box' + index);
        subtask_box.className = 'subtask_box';
    }

    delete(id) {
        axios.delete(API.subtask.replace('task_id', this.props.task).replace('subtask_id', id), { headers })
            .then(() => {
                axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ subtasks: response.data.data });
                    });
            });
    }

    handleSubmitSubtask = e => {
        e.preventDefault();

        const body = {
            title: this.state.add_subtask
        };

        axios.post(API.subtasks.replace('task_id', this.props.task), body, { headers })
            .then(() => {
                axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ subtasks: response.data.data });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This subtask is already exists.";
                }
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });

        clearInput();
    };

    handleUpdateSubtask = id => e => {
        e.preventDefault();

        const body = {
            title: this.state.input_subtask ? this.state.input_subtask : this.state.subtask.title
        };

        axios.put(API.subtask.replace('task_id', this.props.task).replace('subtask_id', id), body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ subtasks: response.data.data });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This subtask is already exists.";
                }
                this.handleModalShowHide();
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    };

    handleChangeSubtask = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    handleDone(id, value) {
        const body = {
            done: !value
        };
        axios.put(API.subtask.replace('task_id', this.props.task).replace('subtask_id', id), body, { headers })
            .then(() => {
                axios.get(API.subtasks.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ subtasks: response.data.data });
                    });
            });
    }


    updateInput() {
        let input = document.getElementById('input_subtask');
        input.value = this.state.subtask.title;
    }

    render() {
        if (!this.state.subtasks) {
            return (<></>);
        }

        let subtasks = [];
        const sorted_subtasks = this.state.subtasks.sort((a, b) => a.id - b.id);

        for (const [subtask_index, subtask] of sorted_subtasks.entries()) {

            subtasks.push(
                <div key={subtask_index} className="form-check mb-3 subtask" onMouseOver={() => this.over(subtask.id)} onMouseOut={() => this.out(subtask.id)}>
                    <input className="form-check-input" id={"flexCheck" + subtask_index} type="checkbox" defaultChecked={subtask.done} onChange={() => this.handleDone(subtask.id, subtask.done)} />
                    <label className="form-check-label" htmlFor={"flexCheck" + subtask_index}><span className="fst-italic pl-1">{subtask.title}</span></label>
                    <div className="subtask_box" id={"subtask_box" + subtask.id}>
                        <i className="fa fa-pencil mr-2" onClick={() => this.handleModalShowHide(subtask)}></i>
                        <i className="fa fa-trash ml-2" onClick={() => this.delete(subtask.id)}></i>
                    </div>
                </div >

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
                <Modal show={this.state.showHide} onEnter={() => { this.updateInput() }}>
                    <Modal.Header closeButton onClick={() => { this.handleModalShowHide(); }}>
                        <Modal.Title>Updating</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form" onSubmit={this.state.subtask && this.handleUpdateSubtask(this.state.subtask.id)}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="subtask-input">
                                        <div className="form-group">
                                            <label htmlFor="input_subtask">Title</label>
                                            <input required type="text" name="input_subtask" id="input_subtask" placeholder="New title..." onChange={this.handleChangeSubtask} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 text-right align-self-end">
                                    <button type="submit" className="button mt-2">Submit</button>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
                <h4 className="subtask-header text-center mb-3">Subtasks</h4>
                {
                    subtasks.length
                        ?
                        <>
                            <div className="subtasks">
                                <ul>
                                    {subtasks}
                                </ul>
                            </div>
                        </>
                        :
                        <h2 className="text-gray text-center my-5">No subtasks</h2>
                }
                <form className="form" onSubmit={this.handleSubmitSubtask}>
                    <div className="row">
                        <div className="col-9">
                            <div className="extras-input">
                                <div className="form-group">
                                    <input required type="text" name="add_subtask" id="add_subtask" placeholder="New subtask..." onChange={this.handleChangeSubtask} />
                                </div>
                            </div>
                        </div>
                        <div className="col-3 text-right">
                            <button type="submit" className="button mt-1">Submit</button>
                        </div>
                    </div>
                </form>
            </>
        );
    }
}
