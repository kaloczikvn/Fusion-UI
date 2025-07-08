import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from '../constants/ActionTypes';
import * as OriginLinkStatus from '../constants/OriginLinkStatus';

export default function OriginLink() {
    const base = useSelector((state) => state.base);
    const user = useSelector((state) => state.user);

    const dispatch = useDispatch();

    const enableBlur = () => {
        dispatch({ type: ActionTypes.SET_BLUR, blur: true });
    };

    const disableMenu = () => {
        dispatch({ type: ActionTypes.SET_MENU, menu: false });
    };

    const setPopup = (popup) => {
        dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
    };

    const onSetLogin = () => {
        dispatch({
            type: ActionTypes.CHANGE_LOGIN_STATUS,
            status: LoginStatus.LOGGING_IN,
        });
    };

    const onRetry = (e) => {
        if (e) e.preventDefault();

        WebUI.Call('LinkOrigin');
    };

    useEffect(() => {
        enableBlur();
        disableMenu();
        WebUI.Call('LinkOrigin');

        return () => {
            setPopup(null);
        };
    }, []);

    let originState = 'Waiting for Origin / EA Desktop...';
    let canRetry = false;
    let spinning = false;

    switch (user.originLinkStatus) {
        case OriginLinkStatus.IDLE:
            originState = 'Waiting for Origin / EA Desktop...';
            spinning = true;
            break;

        case OriginLinkStatus.LINKING:
            originState = 'Linking Account...';
            spinning = true;
            break;

        case OriginLinkStatus.LINK_SUCCESSFUL:
            originState = 'Successfully Linked!';
            break;

        case OriginLinkStatus.CHECKING_OWNERSHIP:
            originState = 'Checking Ownership...';
            spinning = true;
            break;

        case OriginLinkStatus.LINK_FAILED:
            originState = 'Link Failed, Try later';
            canRetry = true;
            break;

        case OriginLinkStatus.PRODUCT_MISSING:
            originState = 'Your account does not own Battlefield 3';
            canRetry = true;
            break;

        case OriginLinkStatus.LINK_TAKEN:
            originState = 'This EA Account is already linked to another account';
            canRetry = true;
            break;

        case OriginLinkStatus.LINK_UNAVAILABLE:
            originState = 'Link Service Unavailable';
            canRetry = true;
            break;

        case OriginLinkStatus.ORIGIN_ERROR:
            originState = 'An error occurred while communicating with Origin / EA Desktop';
            canRetry = true;
            break;
    }

    let retryButton = canRetry ? (
        <a href="#" className="btn border-btn" onClick={onRetry}>
            Retry
        </a>
    ) : null;

    return (
        <div id="origin-link-page">
            <div className="middle-container">
                <h1>Ownership Verification</h1>
                <h2 style={{fontSize: '1.8vmin', padding:'0 20vw', marginTop: '2vmin'}}>
                    In order to use venice unleashed we will first need to verify your game ownership through your EA
                    account. Please launch the EA Desktop app or the Origin client on your computer and log in with your
                    account. This is a one-time process and will link your EA account with your Venice Unleashed
                    account.
                </h2>
                <div className="status-container">
                    <img src="/assets/img/common/origin.svg" className={spinning ? 'spinning' : ''} />
                    <h2>{originState}</h2>
                    {retryButton}
                </div>
            </div>
        </div>
    );
}
