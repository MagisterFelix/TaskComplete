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

export class Extra extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            model: "extra",
            extras: this.props.extra,
            tasks: this.props.task,
            task: this.props.task[0].id,
            showHide: null,
            extra: null,
            information: '',
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


    handleModalShowHide(extra) {
        this.setState({ extra: extra, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    handleDeleteExtra = id => {
        let body = {
            model: this.state.model,
            id: id
        };

        axios.delete(API.admin, { headers: headers, data: body })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ extras: response.data.data.Extra });
                    });
            });
    }

    handleSubmitExtra = e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            task: parseInt(this.state.task),
            information: this.state.information
        };

        axios.post(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ extras: response.data.data.Extra });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This tag is already exists.";
                }
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    }

    handleUpdateExtra = id => e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            id: id,
            task: this.state.task ? parseInt(this.state.task) : this.state.extra.task_id,
            information: this.state.information ? this.state.information : this.state.extra.information
        };

        axios.put(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ extras: response.data.data.Extra });
                    });
            })
            .catch(error => {
                error = error.response.data.message;
                if (error.includes("set")) {
                    error = "This tag is already exists.";
                }
                this.handleModalShowHide();
                this.setState({ errorMessage: error });
                this.handleModalShowHideError();
            });
    }

    handleChangeExtra = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    }

    updateInput() {
        if (this.state.extra) {
            let input = document.getElementById('information');
            input.value = this.state.extra.information;
        }
    }

    render() {
        if (!this.state.extras) {
            return <></>
        }

        const options = [];
        for (const [object_index, object] of this.state.tasks.entries()) {
            options.push(
                <option key={object_index} value={object.id}>{object.title}</option>
            )
        }

        const objects = []
        for (const [object_index, object] of this.state.extras.entries()) {
            objects.push(
                <div key={object_index} className="row" onClick={() => this.handleModalShowHide(object)}>
                    <div className="cell text-center">
                        {object.id}
                    </div>
                    <div className="cell">
                        {object.task_title}
                    </div>
                    <div className="cell">
                        {object.information}
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
                        <form className="form" onSubmit={(this.state.extra && this.handleUpdateExtra(this.state.extra.id)) || this.handleSubmitExtra}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="tag-input">
                                        <div className="form-group">
                                            <label htmlFor="task">{strings.task}</label>
                                            <select required={!this.state.extra} id="task" name="task" onChange={this.handleChangeExtra}>
                                                {options}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="information">{strings.information}</label>
                                            <input required type="text" name="information" id="information" placeholder={strings.new_information} onChange={this.handleChangeExtra} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 d-flex justify-content-end align-self-end mt-5">
                                    {this.state.extra && <button type="button" className="button_delete mt-2" onClick={() => this.handleDeleteExtra(this.state.extra.id)}>{strings.delete}</button>}
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
                                    <div className="cell" style={{ "width": "45%" }}>
                                        Task
                                    </div>
                                    <div className="cell" style={{ "width": "45%" }}>
                                        Information
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
