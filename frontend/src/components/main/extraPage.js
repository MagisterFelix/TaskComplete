import React from "react";
import axios from 'axios';
import API from '../../api/links';
import clearInput from './taskPage';

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Extra extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            extra: null,
            add_extra: null
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get(API.extras.replace('task_id', this.props.task), { headers })
            .then(response => {
                this._isMounted && this.setState({ extra: response.data.data });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevPros) {
        if (prevPros.task !== this.props.task) {
            axios.get(API.extras.replace('task_id', this.props.task), { headers })
                .then(response => {
                    this._isMounted && this.setState({ extra: response.data.data });
                });
        }
    }

    handleSubmitExtra = e => {
        e.preventDefault();

        const body = {
            information: this.state.add_extra
        };

        axios.post(API.extras.replace('task_id', this.props.task), body, { headers })
            .then(() => {
                axios.get(API.extras.replace('task_id', this.props.task), { headers })
                    .then(response => {
                        this._isMounted && this.setState({ extra: response.data.data });
                    });
            });

        clearInput();
    };

    handleChangeExtra = e => {
        e.preventDefault();

        const { name, value } = e.target;

        this.setState({ [name]: value });
    };

    render() {
        if (!this.state.extra) {
            return (<></>);
        }

        let extras = [];
        const sorted_extras = this.state.extra.sort((a, b) => a.id - b.id);

        for (const [extra_index, extra] of sorted_extras.entries()) {

            extras.push(
                <li key={extra_index} className={"extra" + extra_index}>{extra.information}</li>
            )
        }

        return (
            <>
                <h4 className="extras-header text-center my-4">Extra</h4>
                {
                    extras.length
                        ?
                        <>
                            <div className="extras mt-2">
                                <ul>
                                    {extras}
                                </ul>
                            </div>
                        </>
                        :
                        <h2 className="text-gray text-center my-5">No extra</h2>
                }
                <form className="form" onSubmit={this.handleSubmitExtra}>
                    <div className="row">
                        <div className="col-10">
                            <div className="extras-input">
                                <div className="form-group">
                                    <input required type="text" name="add_extra" id="add_extra" placeholder="New information..." onChange={this.handleChangeExtra} />
                                </div>
                            </div>
                        </div>
                        <div className="col-2 text-right">
                            <button type="submit" className="button mt-1">Submit</button>
                        </div>
                    </div>
                </form>
            </>
        );
    }
}
