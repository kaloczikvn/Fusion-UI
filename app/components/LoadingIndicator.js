import React, { useState, useEffect } from 'react';

export default function LoadingIndicator() {
    const [style, setStyle] = useState({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStyle({ borderRadius: '52%' });
        }, 150);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return <i className="loading-indicator" style={style} />;
}
