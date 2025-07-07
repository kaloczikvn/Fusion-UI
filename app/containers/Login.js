import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from '../constants/ActionTypes';
import * as LoginStatus from '../constants/LoginStatus';
import CustomCheckbox from '../components/inputs/Checkbox';

import LoginPopup from '../popups/LoginPopup';

export default function Login() {
    const [capsLock, setCapsLock] = useState(false);

    const base = useSelector((state) => state.base);
    const user = useSelector((state) => state.user);

    const dispatch = useDispatch();

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [rememberMe, setRememberMe] = useState(false); // Use state instead of ref


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

    const onUpdateCapsLock = (e) => {
        const capsLockState = e.getModifierState('CapsLock');
        setCapsLock(capsLockState);
    };


    const onForgotPassword = (e) => {
        if (e) e.preventDefault();

        WebUI.Call('Forgot');
    };

    const onSubmit = (e) => {
        e.preventDefault();

        onSetLogin();
        setPopup(<LoginPopup />);
        WebUI.Call('Login', usernameRef.current.value, passwordRef.current.value, rememberMe);
    };

    const onSignUp = (e) => {
        e.preventDefault();
        WebUI.Call('Signup');
    };

    useEffect(() => {
        enableBlur();
        disableMenu();

        if (user.loginData !== null) {
            onSetLogin();
            setPopup(<LoginPopup />);

            WebUI.Call('Login', user.loginData.username, user.loginData.password, false);
        } else if (user.loginToken !== null) {
            onSetLogin();
            setPopup(<LoginPopup />);

            WebUI.Call('TokenLogin', user.loginToken.token);
        }

        return () => {
            setPopup(null);
        };
    }, []);

    let capsLockNoticeClass = 'capslock-notice';

    if (capsLock) {
        capsLockNoticeClass += ' on';
    }

    return (
        <div id="login-page">
            <form onSubmit={onSubmit}>
                <img src="/assets/img/logo.svg" />

                <label htmlFor="username">Username</label>
                <br />
                <div className="field-container">
                    <input type="text" ref={usernameRef} key="username" id="username" />
                    <br />
                </div>
                <label htmlFor="password">Password</label>
                <br />
                <div className="field-container">
                    <input
                        type="password"
                        ref={passwordRef}
                        key="password"
                        id="password"
                        onKeyDown={onUpdateCapsLock}
                        onKeyUp={onUpdateCapsLock}
                        onMouseDown={onUpdateCapsLock}
                    />
                    <br />
                </div>
                <div className={capsLockNoticeClass}>
                    <strong>WARNING</strong>&nbsp;&nbsp;Caps Lock is on.
                </div>
                <a href="#" className="btn border-btn primary" onClick={onSubmit}>
                    Login
                </a>
                <a href="#" className="btn border-btn" onClick={onSignUp}>
                    Sign Up
                </a>
                <div className="login-actions">
                    <div className="left-actions">
                        <CustomCheckbox
                            label="Remember Me"
                            checked={rememberMe}
                            onChange={setRememberMe}
                        />
                    </div>
                    <div className="right-actions">
                        <a href="#" onClick={onForgotPassword}>
                            Forgot Password
                        </a>
                    </div>
                </div>
                <input
                    type="submit"
                    style={{
                        position: 'absolute',
                        opacity: 0.0,
                        left: '-999999999px',
                    }}
                />
            </form>
        </div>
    );
}
