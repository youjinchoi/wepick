import React, { Component } from 'react';

class Timestamp extends Component {
    render() {
        const now = new Date();
        const diff = now.getTime() - this.props.timestamp;
        if (diff < 3600000) { // < 1시간
            const minute = Math.floor(diff/60000);
            return minute < 1 ? "방금 전" : minute + "분 전"; // n분전
        } else if (diff < 86400000) {   // < 24시간
            const hour = Math.floor(diff/3600000);
            return hour + "시간 전"; // n시간전
        } else {
            const date = new Date(this.props.timestamp);
            let hours = date.getHours();
            if (hours < 10) {
                hours = "0" + hours;
            }
            let minutes = date.getMinutes();
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            return (date.getFullYear() + ". " + (date.getMonth()+1) + ". " + date.getDate() + " " + hours + ":" + minutes);
        }
    }
}

export default Timestamp;