import React from 'react';
import './MultiplierCard.css';

const MultiplierCard = ({ title, data }) => {
    if (!data) return <div className="card loading">Loading {title}...</div>;

    const isHighRisk = data.multiplier > 1.5;

    return (
        <div className={`multiplier-card ${isHighRisk ? 'danger' : 'normal'}`}>
            <h3>{title} Amplification</h3>
            <div className="multiplier-value">{data.multiplier}x</div>
            <div className="causes">
                {data.causes.map((cause, idx) => (
                    <div key={idx} className="cause-item">
                        <span className="cause-factor">{cause.factor}:</span>
                        <span className="cause-explanation">{cause.explanation}</span>
                    </div>
                ))}
            </div>
            <div className="disclaimer">{data.disclaimer}</div>
        </div>
    );
};

export default MultiplierCard;
