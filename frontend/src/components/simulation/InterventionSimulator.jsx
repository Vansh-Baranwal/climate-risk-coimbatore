import React, { useState } from 'react';
import { runSimulation } from '../../services/api';
import './InterventionSimulator.css';

const InterventionSimulator = ({ zone, weather, onSimulate }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async (action) => {
        setLoading(true);
        const data = await runSimulation(zone, weather, action);
        setResult(data);
        setLoading(false);

        // Calculate mitigation factor (e.g., 0.6) to update parent state
        if (onSimulate && data) {
            const factor = data.afterMultiplier / data.beforeMultiplier;
            onSimulate(factor);
        }
    };

    return (
        <div className="intervention-simulator">
            <h3>What-If Scenario Simulator</h3>
            <div className="actions-bar">
                <button onClick={() => handleSimulate('pump')}>Deploy Pumps</button>
                <button onClick={() => handleSimulate('power_cut')}>Cut Power</button>
                <button onClick={() => handleSimulate('tanker')}>Send Tankers</button>
            </div>

            {loading && <div className="sim-loading">Calculating tradeoffs...</div>}

            {result && (
                <div className="sim-result">
                    <div className="sim-header">
                        Action: <strong>{result.action.toUpperCase()}</strong>
                    </div>
                    <div className="sim-comparison">
                        <div className="before">
                            <span>Base Risk</span>
                            <strong>{result.beforeMultiplier}x</strong>
                        </div>
                        <div className="arrow">→</div>
                        <div className="after">
                            <span>Mitigated</span>
                            <strong>{result.afterMultiplier}x</strong>
                        </div>
                    </div>
                    <p className="sim-desc">{result.description}</p>
                    {result.tradeoffs.length > 0 && (
                        <div className="tradeoffs">
                            <strong>Tradeoffs:</strong>
                            <ul>
                                {result.tradeoffs.map(t => <li key={t}>{t}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterventionSimulator;
