import React from "react";
import notFoundImage from "./404.svg";
import './style.scss';

export class NotFound extends React.Component {
    render() {
        return (
            <div className="error" style={{ backgroundImage: "url(" + notFoundImage + ")" }} ></div>
        )
    }
}