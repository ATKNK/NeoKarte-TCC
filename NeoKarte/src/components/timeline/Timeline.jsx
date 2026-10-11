import React, { useState } from "react";
import "./Timeline.css";

import TimelineButton from "./TimelineButton";

function Timeline({ onYearChange }) {
    const years = [1444, 1453, 1466, 1477, 1482, 1494];

    const [index, setIndex] = useState(0);

    const handleChange = (e) => {
        const newIndex = Number(e.target.value);

        setIndex(newIndex);

        const newYear = years[newIndex];

        onYearChange(newYear);
    };

    const handleButtonClick = (buttonIndex) => {
        setIndex(buttonIndex);

        const newYear = years[buttonIndex];

        onYearChange(newYear);
    };

    return (
        <div className="timelineMain">
            <div className="timelineLabels">
                {years.map((year, index) => (
                    <TimelineButton
                        key={year}
                        year={year}
                        desc="Idade Média"
                        action={() => handleButtonClick(index)}
                    />
                ))}
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
    );
}

export default Timeline;