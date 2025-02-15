import React, { Component } from 'react';
import { connect } from 'react-redux'
import * as LoginStatus from "../constants/LoginStatus";

import ExitToAppIcon from './icons/ExitToAppIcon';
import PowerSettingsNewIcon from './icons/PowerSettingsNewIcon';

class TopLeftActions extends Component
{
    render()
    {
        let logoutBtn = null;

        if (this.props.user.loginStatus === LoginStatus.LOGGED_IN)
            logoutBtn = <li><a href="#" onClick={this.onLogout.bind(this)}><ExitToAppIcon /></a></li>;

        return (
            <ul className="top-actions left">
                <li><a href="#" onClick={this.onQuit.bind(this)}><PowerSettingsNewIcon /></a></li>
                {logoutBtn}
            </ul>
        );
    }

    onQuit(e)
    {
        if (e)
            e.preventDefault();

        if (this.props.onQuit)
            this.props.onQuit();
    }

    onLogout(e)
    {
        if (e)
            e.preventDefault();

        if (this.props.onLogoutQuit)
            this.props.onLogoutQuit();
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

export default connect(
    mapStateToProps
)(TopLeftActions);