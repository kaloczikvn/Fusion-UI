import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as ActionTypes from '../constants/ActionTypes';
import { onEnterKeyDown } from '../utils/handlers';

class ServerPasswordPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isCapsLockOn: false,
        };
    }

    render() {
        return (
            <div className="center-notice">
                <div className="notice-content">
                    <h1>Enter Server Password</h1>
                    <form onKeyDown={(e) => onEnterKeyDown(e, this.onSubmit.bind(this))}>
                        <div className="label-wrapper">
                            <label htmlFor="password">Server Password</label>
                            <br />
                            {this.state.isCapsLockOn ? (
                                <div className="caps-lock-notice">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#e8eaed"
                                    >
                                        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                    </svg>
                                    CAPS LOCK IS ON
                                </div>
                            ) : null}
                        </div>

                        <div className="field-container">
                            <input
                                type="password"
                                name="password"
                                ref="password"
                                id="password"
                                onKeyDown={this.onUpdateCapsLock}
                                onKeyUp={this.onUpdateCapsLock}
                                onMouseDown={this.onUpdateCapsLock}
                            />
                        </div>

                        <div className="form-actions">
                            <a href="#" className="btn border-btn" onClick={this.onClosePopup.bind(this)}>
                                Close
                            </a>
                            <a href="#" className="btn border-btn primary" onClick={this.onSubmit.bind(this)}>
                                Connect
                            </a>
                        </div>
                        <input type="submit" style={{ position: 'absolute', opacity: 0.0 }} />
                    </form>
                </div>
            </div>
        );
    }

    onUpdateCapsLock = (e) => {
        const isCapsLockOn = e.getModifierState('CapsLock');

        if (this.state.isCapsLockOn !== isCapsLockOn) this.setState({ isCapsLockOn });
    };

    onClosePopup(e) {
        if (e) e.preventDefault();

        this.props.closePopup();
    }

    onSubmit(e) {
        if (e) e.preventDefault();

        let serverPassword = this.refs.password.value;

        this.props.closePopup();

        if (this.props.onJoin) this.props.onJoin(this.props.server.guid, serverPassword);
    }

    componentDidMount() {
        document.activeElement.blur();

        if (this.refs.password) this.refs.password.focus();
    }
}

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        closePopup: () => {
            dispatch({ type: ActionTypes.SET_POPUP, popup: null });
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServerPasswordPopup);
