import React, { Component } from 'react';

export default class SoldierEntry extends Component {
    onFilteredClick(cb, e) {
        if (e)
            e.stopPropagation();

        if (cb)
            cb(e);
    }

    _onMainClick = (e) => {
        if (e)
            e.preventDefault();

        if (this.props.actions && this.props.actions.length > 0)
            this.props.actions[0].callback(e);
    };

    getIcon(icon) {
        switch (icon) {
            case 'exit_to_app':
                return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-160h80v160h560v-560H200v160h-80v-160q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm220-160-56-58 102-102H120v-80h346L364-622l56-58 200 200-200 200Z" /></svg>;
            case 'delete':
                return <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>;
            case 'library_add':
                return <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e8eaed"><path d="M520-400h80v-120h120v-80H600v-120h-80v120H400v80h120v120ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" /></svg>
        }
    }

    render() {
        let actions = [];

        if (this.props.actions && this.props.actions.length > 0) {
            for (let i = 0; i < this.props.actions.length; ++i) {
                let action = this.props.actions[i];
                actions.push(<a key={i} href="#" onClick={this.onFilteredClick.bind(this, action.callback)}>
                    {this.getIcon(action.icon)}
                </a>);
            }
        }

        let name = null;

        if (this.props.name && this.props.name.length > 0)
            name = <h1>{this.props.name}</h1>;

        let className = 'soldier-entry';

        if (this.props.className && this.props.className.length > 0)
            className += ' ' + this.props.className;

        let deleteButton = null;

         if (this.props.deleteCallback)
            deleteButton = <a href="#" onClick={this.onFilteredClick.bind(this, this.props.deleteCallback)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg></a>;

        return (
            <div className={className} onClick={this._onMainClick}>
                <div className="actions">
                    {actions}
                </div>
                <div className="bottom-content">
                    <h2>{this.props.title}</h2>
                    {name}
                    {deleteButton}
                </div>
            </div>
        );
    }
}