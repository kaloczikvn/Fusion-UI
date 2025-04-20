import React from 'react';

export default function Watermark({ build }) {
    return (
        <div id="watermark">
            <img src="/assets/img/logo-outline.svg" />
            {build && <span>#{build}</span>}
        </div>
    );
}
