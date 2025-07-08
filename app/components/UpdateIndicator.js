import React from 'react';
import { useSelector } from 'react-redux';

import * as UpdateError from '../constants/UpdateError';
import * as UpdateState from '../constants/UpdateState';

import LoadingIndicator from './LoadingIndicator';
import ProgressIndicator from './ProgressIndicator';

export default function UpdateIndicator() {
    const update = useSelector((state) => state.update);

    const renderEmpty = () => {
        return <div />;
    };

    const renderChecking = () => {
        return (
            <div className="update-indicator">
                <div className="update-indicator-container">
                    <span>Starting Update</span>
                    <LoadingIndicator />
                </div>
            </div>
        );
    };

    const renderUpdating = () => {
        const percentage = Math.round(update.percentage * 100.0);
        if (percentage >= 99.9) {
            return (
                <div className="update-indicator">
                    <div className="update-indicator-container">
                        <span style={{paddingLeft: '1vmin'}}>Finishing Update</span>
                        <ProgressIndicator percentage={100} />
                    </div>
                </div>
            );
        }

        return (
            <div className="update-indicator">
                <div className="update-indicator-container">
                    <span style={{paddingLeft: '1vmin'}}>Updating {percentage}%</span>
                    <ProgressIndicator percentage={update.percentage * 100.0} />
                </div>
            </div>
        );
    };

    const renderUpdated = () => {
        return (
            <div className="update-indicator updated">
                <div className="update-indicator-container">
                    <span>Update Ready</span>
                    <ProgressIndicator percentage={100} completed={true} />
                </div>
            </div>
        );
    };

    const renderError = () => {
        let errorText = 'Update Error';

        switch (update.error) {
            case UpdateError.ACCESS_ERROR:
                errorText = 'Access Error';
                break;

            case UpdateError.DECOMPRESSION_ERROR:
            case UpdateError.DOWNLOAD_ERROR:
                errorText = 'Download Failed';
                break;
        }

        return (
            <div className="update-indicator error">
                <div className="update-indicator-container">
                    <span>{errorText}</span>
                    <ProgressIndicator percentage={100} error={true} />
                </div>
            </div>
        );
    };

    switch (update.state) {
        case UpdateState.IDLE: {
            if (update.error !== UpdateError.NONE) return renderError();

            return renderEmpty();
        }

        case UpdateState.CHECKING_FOR_UPDATES:
        case UpdateState.DOWNLOADING_FILE_LIST:
            return renderChecking();

        case UpdateState.UPDATING:
            return renderUpdating();

        case UpdateState.DONE_UPDATING:
            return renderUpdated();

        default:
            return renderEmpty();
    }
}
