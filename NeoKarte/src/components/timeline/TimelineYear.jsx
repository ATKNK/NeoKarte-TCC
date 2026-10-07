function TimelineYear(props){
    return(
        <div className="timelineYearMain">
            <span>{props.year}</span>
            <div className="timelineYearDesc">
                <img className="timelineYearIcon" src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Maki-castle-11.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"/>
                <span>Idade Média</span>
            </div>
        </div>
    );
}

export default TimelineYear;