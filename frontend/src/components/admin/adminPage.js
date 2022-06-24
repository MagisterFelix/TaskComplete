import React from "react";
import "./style.scss";
import axios from 'axios';
import API from '../../api/links';
import strings from "../../locale/locale";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';


const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            info: this.props.info
        }

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    backup() {
        headers['command'] = 'backup';
        axios.get(API.admin, { headers })
            .then(response => {
                const regExpFilename = /filename="(?<filename>.*)"/;
                const filename = regExpFilename.exec(response.headers['content-disposition']).groups.filename;
                let fileDownload = require('js-file-download');
                fileDownload(response.data, filename);
            });
    }

    restore() {
        let restore_button = document.getElementById('restore');
        restore_button.click();
        restore_button.addEventListener('change', () => {
            headers['command'] = 'restore/' + restore_button.value.split('\\')[2];
            axios.get(API.admin, { headers })
                .then(() => {
                    toast.success(strings.notifications_success);
                })
                .catch(() => {
                    toast.error(strings.notifications_failure);
                });
        });
    }

    render() {
        if (!this.state.info) {
            return <></>
        }

        const tables = []
        for (const [table_index, table] of Object.keys(this.state.info).entries()) {
            tables.push(
                <Link key={table_index} to={'/admin/' + table.toLowerCase() + 's'} className="row">
                    <div className="cell">
                        {table}
                    </div>
                </Link>
            )
        }

        return (
            <div className="admin" style={{ 'overflow': 'hidden' }}>
                <div className="container backup mt-5">
                    <button type="button" className="button_additional" onClick={this.backup}>{strings.backup}</button>
                    <input type="file" id="restore" hidden />
                    <button type="file" className="button_additional" onClick={this.restore}>{strings.restore}</button>
                </div>
                <div className="limiter">
                    <div className="container-table100">
                        <div className="wrap-table100">
                            <div className="table">
                                <div className="row header">
                                    <div className="cell">
                                        {strings.tables}
                                    </div>
                                </div>
                                {tables}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
