import React from "react";
import "./style.scss";
import axios from 'axios';
import API from '../../api/links';
import strings from "../../locale/locale";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
);

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const DAYS_FROM_TODAY = 15;

export const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: strings.pie_title,
        },
    },
};

export const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: strings.doughnut_title,
        },
    },
};

export const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: strings.line_title,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        },
    }
};

export class Statistics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            statistics: null,
        }

        this._isMounted = false;
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        this._isMounted = true;
        axios.get(API.statistics, { headers })
            .then(response => {
                this._isMounted && this.setState({ statistics: response.data.data });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getDays() {
        const days = [];
        for (let i = -DAYS_FROM_TODAY; i <= DAYS_FROM_TODAY; ++i) {
            const day = new Date();
            days.push(day.setDate(day.getDate() + i));
        }
        return days;
    }

    getLabels() {
        let labels = [];
        const months = [strings.january, strings.february, strings.march, strings.april, strings.may, strings.june, strings.july, strings.august, strings.september, strings.october, strings.november, strings.december];
        for (const day of this.getDays()) {
            let date = new Date(day);
            labels.push(date.getDate() + ' ' + months[date.getMonth()]);
        }
        return labels;
    }

    getData() {
        let data = new Array(this.getDays().length).fill(0);
        for (const [index, day] of this.getDays().entries()) {
            let label_date = new Date(day);
            for (const task of this.state.statistics.active_tasks) {
                let date = new Date(task.date);
                if (date.getDate() == label_date.getDate() && date.getMonth() == label_date.getMonth() && date.getFullYear() == label_date.getFullYear()) {
                    ++data[index];
                }
            }
        }
        return data;
    }

    getVerdict() {
        if (!this.state.statistics.active) {
            return [strings.zero_tasks_verdict, null]
        }

        if (!this.state.statistics.fatigue.is_get_tired) {
            return [strings.good_verdict, null];
        }

        let verdict = "";
        for (const [index, dates] of this.state.statistics.fatigue.tired_days_range.entries()) {
            let start_date = new Date(dates[0]);
            let end_date = new Date(dates[1]);
            if (start_date.getTime() !== end_date.getTime()) {
                verdict += " " + strings.from + " " + ('0' + (start_date.getDate())).slice(-2) + '.' + ('0' + (start_date.getMonth() + 1)).slice(-2) + " " + strings.to + " " + ('0' + (end_date.getDate())).slice(-2) + '.' + ('0' + (end_date.getMonth() + 1)).slice(-2);
            } else {
                verdict += " " + ('0' + (start_date.getDate())).slice(-2) + '.' + ('0' + (start_date.getMonth() + 1)).slice(-2);
            }
            if (index != this.state.statistics.fatigue.tired_days_range.length - 1) {
                verdict += ",";
            }
        }
        return [strings.bad_verdict, verdict];
    }

    getColors() {
        let colors = []
        for (const value of this.getData()) {
            if (value == 0) {
                colors.push('rgba(255, 25, 250, 0.3)');
            } else {
                colors.push('rgba(255, 25, 50, 1)');
            }
        }
        return colors;
    }

    render() {
        if (!this.state.statistics) {
            return <></>
        }

        return (
            <div className="statistics">
                <div className="wrapper">
                    <div className="row">
                        <div className="col">
                            <div className="header">{strings.statistics}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="content">
                                <div className="row">
                                    {
                                        this.state.statistics.active ?
                                            <>
                                                <div className="col-6">
                                                    <Pie options={pieOptions} data={{
                                                        labels: [strings.free_days, strings.busy_days],
                                                        datasets: [
                                                            {
                                                                data: [this.state.statistics.free_days, this.state.statistics.busy_days],
                                                                backgroundColor: [
                                                                    'rgba(150, 150, 150, 0.2)',
                                                                    'rgba(255, 200, 0, 0.2)',
                                                                ],
                                                                borderColor: [
                                                                    'rgba(150, 150, 150, 1)',
                                                                    'rgba(255, 200, 0, 1)',
                                                                ],
                                                                borderWidth: 1,
                                                            }
                                                        ]
                                                    }} width={400} height={400} />
                                                </div>
                                                <div className="col-6">
                                                    <Doughnut options={doughnutOptions} data={{
                                                        labels: [strings.active, strings.completed, strings.missed],
                                                        datasets: [
                                                            {
                                                                data: [this.state.statistics.active, this.state.statistics.done, this.state.statistics.missed],
                                                                backgroundColor: [
                                                                    'rgba(25, 200, 255, 0.2)',
                                                                    'rgba(25, 255, 25, 0.2)',
                                                                    'rgba(255, 25, 25, 0.2)',
                                                                ],
                                                                borderColor: [
                                                                    'rgba(25, 200, 255, 1)',
                                                                    'rgba(25, 255, 25, 1)',
                                                                    'rgba(255, 25, 25, 1)',
                                                                ],
                                                                borderWidth: 1,
                                                            }
                                                        ]
                                                    }} width={400} height={400} />
                                                </div>
                                            </>
                                            :
                                            <div className="col-12">
                                                <Pie options={pieOptions} data={{
                                                    labels: [strings.free_days, strings.busy_days],
                                                    datasets: [
                                                        {
                                                            data: [this.state.statistics.free_days, this.state.statistics.busy_days],
                                                            backgroundColor: [
                                                                'rgba(150, 150, 150, 0.2)',
                                                                'rgba(255, 200, 0, 0.2)',
                                                            ],
                                                            borderColor: [
                                                                'rgba(150, 150, 150, 1)',
                                                                'rgba(255, 200, 0, 1)',
                                                            ],
                                                            borderWidth: 1,
                                                        }
                                                    ]
                                                }} width={400} height={400} />
                                            </div>
                                    }
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <Line options={lineOptions} data={{
                                            labels: this.getLabels(),
                                            datasets: [
                                                {
                                                    label: strings.count_of_tasks,
                                                    data: this.getData(),
                                                    borderColor: this.getColors(),
                                                    backgroundColor: this.getColors()
                                                }
                                            ]
                                        }} width={1800} height={200} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="footer">
                                <div className="verdict">
                                    {this.getVerdict()[0]} <b>{this.getVerdict()[1]}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
