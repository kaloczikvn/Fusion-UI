import React from 'react';
import UpdateIndicator from './UpdateIndicator';

export default function TopRightActions() {
    return (
        <ul className="top-actions right">
            <li>
                <UpdateIndicator />
            </li>
        </ul>
    );
}
