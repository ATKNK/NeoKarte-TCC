import React from "react";
import './Timeline.css'

function TimelineButton(props) {
    return (
        <button className="timelineButton">
            {props.year}
        </button>
    );
}

export default TimelineButton;