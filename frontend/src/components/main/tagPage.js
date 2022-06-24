import React from "react";
import axios from 'axios';
import API from '../../api/links';
import { Modal } from "react-bootstrap";
import clearInput from "./taskPage";
import strings from "../../locale/locale"

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Tag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: null,
            showHide: false,
            update_tag: null,
            add_tag: null,
            tag: null,
            showHideError: false,
            errorMessage: null
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get(API.tags.replace('task_id', this.props.task), { headers })
            .then(response => {
                this._isMounted && this.setState({ tags: response.data.data });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevPros) {
        if (prevPros.task !== this.props.task) {
            axios.get(API.tags.replace('task_id', this.props.task), { headers })
                .then(response => {
                    this._isMounted && this.setState({ tags: response.data.data });
                });
        }
    }

    handleModalShowHide(tag) {
        this.setState({ tag: tag, showHide: !this.state.showHide });
    }

    handleModalShowHideError() {
        this.setState({ showHideError: !this.state.showHideError });
    }

    over(index) {
        let tag_box = document.getElementById('tag_box' + index);
        tag_box.className = 'tag_boxHover';
    }

    out(index) {
        let tag_box = document.getElementById('tag_box' + index);
        tag_box.className = 'tag_box';
    }

    handleDeleteTag = id => {
        axios.delete(API.tag.replace('task_id', this.props.task).replace('tag_id', id).replace('subtask_id', id), { headers })
            .then(() => {
                axios.get(API.tags.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data });
                    });
            });
    }

    handleSubmitTag = e => {
        e.preventDefault();

        const body = {
            title: this.state.add_tag
        };

        axios.post(API.tags.replace('task_id', this.props.task), body, { headers })
            .then(() => {
                axios.get(API.tags.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data });
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

        clearInput();
    };

    handleUpdateTag = id => e => {
        e.preventDefault();

        const body = {
            title: this.state.update_tag ? this.state.update_tag.toLowerCase() : this.state.tag.title
        };

        axios.put(API.tag.replace('task_id', this.props.task).replace('tag_id', id), body, { headers })
            .then(() => {
                this.handleModalShowHide();
                axios.get(API.tags.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ tags: response.data.data });
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
    };

    handleChangeTag = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    updateInput() {
        let input = document.getElementById('update_tag');
        input.value = this.state.tag.title;
    }

    render() {
        if (!this.state.tags) {
            return (<></>);
        }

        let tags = [];
        const sorted_tags = this.state.tags.sort((a, b) => a.id - b.id);

        for (const [tag_index, tag] of sorted_tags.entries()) {

            tags.push(
                <h6 key={tag_index} className="mr-1 tag" onMouseOver={() => this.over(tag.id)} onMouseOut={() => this.out(tag.id)}>
                    #{tag.title.toLowerCase()}
                    <div className="tag_box" id={"tag_box" + tag.id}>
                        <i className="fa fa-pencil mr-2" onClick={() => this.handleModalShowHide(tag)}></i>
                        <i className="fa fa-trash ml-2" onClick={() => this.handleDeleteTag(tag.id)}></i>
                    </div>
                </h6>
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
                <Modal show={this.state.showHide} onEnter={() => { this.updateInput() }}>
                    <Modal.Header closeButton onClick={() => { this.handleModalShowHide(); }}>
                        <Modal.Title>{strings.updating}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form" onSubmit={this.state.tag && this.handleUpdateTag(this.state.tag.id)}>
                            <div className="row">
                                <div className="col-7">
                                    <div className="tag-input">
                                        <div className="form-group">
                                            <label htmlFor="input_tag">{strings.title}</label>
                                            <input required type="text" name="update_tag" id="update_tag" placeholder={strings.new_title} onChange={this.handleChangeTag} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5 text-right align-self-end">
                                    <button type="submit" className="button mt-2">{strings.submit}</button>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
                <div className="addTag" id={"addTag" + this.props.task}>
                    <form className="form" onSubmit={this.handleSubmitTag}>
                        <div className="row">
                            <div className="col-7">
                                <div className="tags-input">
                                    <div className="form-group">
                                        <input required type="text" name="add_tag" id="add_tag" placeholder={strings.new_tag} onChange={this.handleChangeTag} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-5 text-left">
                                <button type="submit" className="buttonTag mt-2"><i className="fa fa-plus-circle" aria-hidden="true"></i></button>
                            </div>
                        </div>
                    </form>
                </div>
                {
                    tags.length
                        ?
                        <>
                            <div className="tags d-flex align-items-center mt-1 ml-3">
                                {tags}
                            </div>
                        </>
                        :
                        <></>
                }
            </>
        );
    }
}
