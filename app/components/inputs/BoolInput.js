// BoolInput.js
import React, { Component } from "react";
import "./BoolInput.scss";

export default class BoolInput extends Component {
    handleClick = () => {
        if (this.props.onChange) {
            // Create a synthetic event object similar to checkbox change event
            const syntheticEvent = {
                target: {
                    checked: !this.props.value,
                    value: !this.props.value
                }
            };
            this.props.onChange(syntheticEvent);
        }
    }

    handleKeyDown = (e) => {
        // Allow toggling with Enter or Space key for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick();
        }
    }

    handleOffClick = () => {
        if (this.props.value && this.props.onChange) {
            const syntheticEvent = {
                target: {
                    checked: false,
                    value: false
                }
            };
            this.props.onChange(syntheticEvent);
        }
    }

    handleOnClick = () => {
        if (!this.props.value && this.props.onChange) {
            const syntheticEvent = {
                target: {
                    checked: true,
                    value: true
                }
            };
            this.props.onChange(syntheticEvent);
        }
    }

    render() {
        return (
            <div 
                className={`bool-input ${this.props.value ? 'checked' : ''}`}
                tabIndex="0"
                role="switch"
                aria-checked={this.props.value}
                aria-label="Toggle switch"
                onKeyDown={this.handleKeyDown}
            >
                <span 
                    className={`option off ${!this.props.value ? 'active' : ''}`}
                    onClick={this.handleOffClick}
                >
                    Off
                </span>
                <span 
                    className={`option on ${this.props.value ? 'active' : ''}`}
                    onClick={this.handleOnClick}
                >
                    On
                </span>
            </div>
        );
    }
}