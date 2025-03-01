import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as ActionTypes from '../constants/ActionTypes'

class MainMenu extends Component
{
    render()
    {
        let newsLeft = {
            title: "Please wait",
            description: "Fetching latest news...",
            link: "#",
        };

        let newsRight = {
            title: "Please wait",
            description: "Fetching latest news...",
            link: "#",
        };

        if (this.props.base.news !== null) {
            newsLeft = this.props.base.news.newsLeft;
            newsRight = this.props.base.news.newsRight;
        }

        return (
            <div className="main-menu content-wrapper">
                <div className="main-container left">
                    <a className="news-item" href={newsLeft.link} onClick={this.openNewsLink.bind(this, newsLeft.link)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="86px" width="86px" viewBox="0 -960 960 960" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
                        <div className="news-description">
                            <h2>{newsLeft.title}</h2>
                            <h1>{newsLeft.description}</h1>
                        </div>
                    </a>
                </div>
                <div className="main-container right">
                    <a className="news-item secondary" href={newsRight.link} onClick={this.openNewsLink.bind(this, newsRight.link)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="86px" width="86px" viewBox="0 -960 960 960" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
                        <div className="news-description">
                            <h2>{newsRight.title}</h2>
                            <h1>{newsRight.description}</h1>
                        </div>
                    </a>
                </div>
            </div>
        );
    }

    openNewsLink = (link, e) =>
    {
        if (e) {
            e.preventDefault();
        }

        if (link === '#') {
            return;
        }

        WebUI.Call('OpenLink', link);
    };

    componentDidMount()
    {
        this.props.disableBlur();
        this.props.enableMenu();
    }

    onQuit(e)
    {
        if (e)
            e.preventDefault();

        WebUI.Call('Quit');
    }
}

const mapStateToProps = (state) => {
    return {
        base: state.base,
        user: state.user
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        disableBlur: () => {
            dispatch({ type: ActionTypes.SET_BLUR, blur: false })
        },
        enableMenu: () => {
            dispatch({ type: ActionTypes.SET_MENU, menu: true })
        }
    };
};

export default connect(
    mapStateToProps, mapDispatchToProps
)(MainMenu);
