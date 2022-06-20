import React from "react";
import "./style.scss";
import { Task } from "./taskPage";

export class Main extends React.Component {

    componentDidMount() {
        document.body.style.overflow = 'auto';
    }

    render() {

        return (
            <Task user={this.props.user} />
        );
    }
}
