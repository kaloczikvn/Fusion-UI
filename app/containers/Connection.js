import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as ActionTypes from '../constants/ActionTypes';
import * as ConnectionStatus from '../constants/ConnectionStatus';
import LoadingIndicator from '../components/LoadingIndicator';

export default function Connection() {
    const base = useSelector((state) => state.base);

    const dispatch = useDispatch();

    const enableBlur = () => {
        dispatch({ type: ActionTypes.SET_BLUR, blur: true });
    };

    const disableMenu = () => {
        dispatch({ type: ActionTypes.SET_MENU, menu: false });
    };

    useEffect(() => {
        enableBlur();
        disableMenu();
    }, []);

    const onReconnect = (e) => {
        e.preventDefault();
        WebUI.Call('Reconnect');
    };

    if (base.connectionStatus === ConnectionStatus.DISCONNECTED) {
        return (
            <div className="center-notice">
                <div className="notice-content">
                    <h1>Connection Error</h1>
                    <p>You have been disconnected from the Zeus Backend.</p>
                    <a href="#" className="btn border-btn" onClick={onReconnect}>
                        Reconnect
                    </a>
                </div>
            </div>
        );
    }

    if (base.connectionStatus === ConnectionStatus.CONNECTING || base.connectionStatus === ConnectionStatus.CONNECTED) {
        return (
            <div className="center-notice">
                <div className="notice-content">
                    <h1>Connecting</h1>
                    <p>Connecting to the Zeus Backend. Please wait...</p>
                    <LoadingIndicator />
                </div>
            </div>
        );
    }

    let errorCode = 'Unknown';

    if (base.error && 'code' in base.error) {
        switch (base.error.code) {
            case 0:
                errorCode = 'Connection timed out.';
                break;

            case 4:
                errorCode = 'No servers available.';
                break;

            case 23:
                errorCode = 'Servers are busy. Keep retrying.';
                break;

            default:
                errorCode = 'Unknown (' + base.error.code + ')';
        }
    }

    return (
        <div className="center-notice">
            <div className="notice-content">
                <h1>Connection Failed</h1>
                <p>Could not connect to the Zeus Backend. Reason: {errorCode}.</p>
                <a href="#" className="btn border-btn" onClick={onReconnect}>
                    Reconnect
                </a>
            </div>
        </div>
    );
}
