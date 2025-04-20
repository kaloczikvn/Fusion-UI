import React from 'react';
import { useSelector } from 'react-redux';
import * as LoginStatus from '../constants/LoginStatus';

import ExitToAppIcon from './icons/ExitToAppIcon';
import PowerSettingsNewIcon from './icons/PowerSettingsNewIcon';

export default function TopLeftActions({ onQuit, onLogoutQuit }) {
    const user = useSelector((state) => state.user);

    const handleQuit = (e) => {
        if (e) e.preventDefault();

        if (onQuit) onQuit();
    };

    const handleLogout = (e) => {
        if (e) e.preventDefault();

        if (onLogoutQuit) onLogoutQuit();
    };

    return (
        <ul className="top-actions left">
            <li>
                <a href="#" onClick={handleQuit}>
                    <PowerSettingsNewIcon />
                </a>
            </li>
            {user.loginStatus === LoginStatus.LOGGED_IN && (
                <li>
                    <a href="#" onClick={handleLogout}>
                        <ExitToAppIcon />
                    </a>
                </li>
            )}
        </ul>
    );
}
