import React from 'react';

export default function ProgressIndicator({ percentage, completed, error }) {
    let roundedPercentage = Math.round(percentage);
    
    roundedPercentage = Math.max(0, Math.min(100, roundedPercentage));
    
    let pathStroke = '#fff';
    
    if (completed) pathStroke = 'rgba(176, 255, 136, 0.82)';
    if (error) pathStroke = 'rgb(255, 95, 95)';
    
    const size = 20;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    
    const angle = (roundedPercentage / 100) * 360;
    const endAngle = angle - 90; 
    
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const endX = center + radius * Math.cos(endAngleRad);
    const endY = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = roundedPercentage > 0 
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
        : '';
    
    return (
        <div className="progress-indicator">
            <svg className='CircularProgressbar'
                style={{ transform: 'rotateZ(0deg) translate(0.4vh, 0.3vh)' }}
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                />
                
                {roundedPercentage > 0 && (
                    <path
                        d={pathData}
                        fill="none"
                        stroke={pathStroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                    />
                )}
                
                {roundedPercentage === 100 && (
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={pathStroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                    />
                )}
            </svg>
        </div>
    );
}