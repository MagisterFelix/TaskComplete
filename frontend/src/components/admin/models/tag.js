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

export class Tag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            model: "tag",
            tags: this.props.tag,
            tasks: this.props.task,
            task: this.props.task[0].id,
            showHide: null,
            tag: null,
            title: '',
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

    handleModalShowHide(tag) {
        this.setState({ tag: tag, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    handleDeleteTag = id => {
        let body = {
            model: this.state.model,
            id: id
        };

        axios.delete(API.admin, { headers: headers, data: body })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data.Tag });
                    });
            });
    }

    handleSubmitTag = e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            task: parseInt(this.state.task),
            title: this.state.title
        };

        axios.post(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data.Tag });
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

    handleUpdateTag = id => e => {
        e.preventDefault();

        const body = {
            model: this.state.model,
            id: id,
            task: this.state.task ? parseInt(this.state.task) : this.state.tag.task_id,
            title: this.state.title ? this.state.title : this.state.tag.title
        };

        axios.put(API.admin, body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.admin, { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data.Tag });
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

    handleChangeTag = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    }

    updateInput() {
        if (this.state.tag) {
            let input = document.getElementById('title');
            input.value = this.state.tag.title;
        }
    }

    render() {
        if (!this.state.tags) {
            return <></>
        }

        const options = [];
        for (const [object_index, object] of this.state.tasks.entries()) {
            options.push(
                <option key={object_index} value={object.id}>{object.title}</option>
            )
        }

        const objects = []
        for (const [object_index, object] of this.state.tags.entries()) {
            objects.push(
                <div key={object_index} className="row" onClick={() => this.handleModalShowHide(object)}>
                    <div className="cell text-center">
                        {object.id}
                    </div>
                    <div className="cell">
                        {object.task_title}
                    </div>
                    <div className="cell">
                        {object.title}
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
                        <form className="form" onSubmit={(this.state.tag && this.handleUpdateTag(this.state.tag.id)) || this.handleSubmitTag}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="tag-input">
                                        <div className="form-group">
                                            <label htmlFor="task">{strings.task}</label>
                                            <select required={!this.state.tag} id="task" name="task" onChange={this.handleChangeTag}>
                                                {options}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="title">{strings.title}</label>
                                            <input required type="text" name="title" id="title" placeholder={strings.new_title} onChange={this.handleChangeTag} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 d-flex justify-content-end align-self-end mt-5">
                                    {this.state.tag && <button type="button" className="button_delete mt-2" onClick={() => this.handleDeleteTag(this.state.tag.id)}>{strings.delete}</button>}
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
                                        Title
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
