import React, { useEffect, useState } from 'react';
import { fetchTimeline } from '../../services/api';
import './RiskTimeline.css';

const RiskTimeline = ({ stagnationDays }) => {
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        if (stagnationDays !== undefined) {
            fetchTimeline(stagnationDays).then(data => {
                if (data && data.timeline) setTimeline(data.timeline);
            });
        }
    }, [stagnationDays]);

    if (!timeline.length) return null;

    return (
        <div className="risk-timeline">
            <h3>Predicted Disaster Phase Timeline</h3>
            <div className="timeline-container">
                {timeline.map((phase, idx) => (
                    <div key={idx} className="timeline-phase">
                        <div className="phase-days">{phase.days} Days</div>
                        <div className="phase-content">
                            <h4>{phase.phase}</h4>
                            <p type={phase.riskType}>{phase.riskType}</p>
                            <small>{phase.description}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskTimeline;
