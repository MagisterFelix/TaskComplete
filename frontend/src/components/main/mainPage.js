import React from "react";
import "./style.scss";
import { Task } from "./taskPage";

export class Main extends React.Component {

    render() {

        return (
            <Task user={this.props.user} />
        );
    }
}
