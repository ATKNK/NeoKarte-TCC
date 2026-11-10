function TimelineYear(props){

    const year = props.year;
    let description;

    if (year >= -4000 && year <= 476){
        description = "Antiquity"
    }
    if (year >= 476 && year <= 1453){
        description = "Middle Ages";
    }
    if (year >= 1453 && year <= 1793){
        description = "Modern Era"
    }
    if (year >= 1793){
        description = "Current Era"
    }

    return(
        <div className="timelineYearMain">
            <span>{props.year}</span>
            <div className="timelineYearDesc">
                <img className="timelineYearIcon" src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Maki-castle-11.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"/>
                <span id="timelineYearDescLabel">{description}</span>
            </div>
        </div>
    );
}

export default TimelineYear;