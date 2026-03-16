import React, { useState } from "react";
import './Timeline.css'
import TimelineButton from "./TimelineButton";

function Timeline({ onYearChange }) {

    const [year, setYear] = useState(1444);
    const years = [1444, 1453, 1466, 1477, 1482, 1494];

    const [index, setIndex] = useState(0);

    const handleChange = (e) => {
        const newIndex = Number(e.target.value);
        setIndex(newIndex);

        const newYear = years[newIndex];
        onYearChange(newYear);
    };

    return (
        <div className="timelineMain">
            <div className="timelineLabels">
                <TimelineButton year={"1444"} />
                <TimelineButton year={"1453"} />
                <TimelineButton year={"1466"} />
                <TimelineButton year={"1477"} />
                <TimelineButton year={"1482"} />
                <TimelineButton year={"1494"} />
            </div>

            <input
                type="range"
                id="timelineRange"
                name="Ano"
                min={0}
                max={years.length - 1}
                value={index}
                onChange={handleChange}
            />
        </div>
    )
}

export default Timeline;