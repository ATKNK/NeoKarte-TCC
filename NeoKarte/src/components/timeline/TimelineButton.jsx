import React from "react";
import './Timeline.css'
import TimelineYear from "./TimelineYear";

function TimelineButton(props) {
    return (
        <button className="timelineButton" onClick={props.action}>
            <TimelineYear year={props.year} desc={"Teste Descrição"}/>
        </button>
    );
}

export default TimelineButton;