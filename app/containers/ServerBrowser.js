import React, { Component } from 'react'
import { connect } from 'react-redux'
import PerfectScrollbar from 'perfect-scrollbar';

import * as ServerFetchStatus from '../constants/ServerFetchStatus'
import * as ServerConnectStatus from '../constants/ServerConnectStatus'
import * as ActionTypes from '../constants/ActionTypes'
import * as AccountStorageKeys from '../constants/AccountStorageKeys';
import * as ServerSort from '../constants/ServerSort'
import * as SortDirection from '../constants/SortDirection'

import ConnectingServerPopup from '../popups/ConnectingServerPopup'
import ServerEntry from "../components/ServerEntry";
import ServerFilters from "../components/ServerFilters";

class ServerBrowser extends Component {
    constructor(props) {
        super(props);

        this.scrollbar = null;

        this.browserRef = React.createRef();
        this.headerRef = React.createRef();

        this.state = {
            expandedServer: null,
            filtersVisible: false,
            width: 920,
            height: 580,
        };
    }

    _onSortByMap = (e) => {
        if (e)
            e.preventDefault();

        this.sortBy(ServerSort.MAP);
    };

    _onSortByGamemode = (e) => {
        if (e)
            e.preventDefault();

        this.sortBy(ServerSort.GAMEMODE);
    };

    _onSortByPlayers = (e) => {
        if (e)
            e.preventDefault();

        this.sortBy(ServerSort.PLAYERS);
    };

    _onSortByPing = (e) => {
        if (e)
            e.preventDefault();

        this.sortBy(ServerSort.PING);
    };

    sortBy(sortBy) {
        if (this.props.servers.sortBy !== sortBy) {
            this.props.sortServersBy(sortBy, SortDirection.ASC);
            return;
        }

        this.props.cycleServerSortDirection();
    }

    _onServerList = (ref) => {
        if (ref === null) {
            this.scrollbar = null;
            return;
        }

        this.scrollbar = new PerfectScrollbar(ref, {
            wheelSpeed: 3,
            suppressScrollX: true
        });
    };

    componentDidUpdate() {
        if (this.scrollbar !== null)
            this.scrollbar.update();
    }

    render() {
        let servers = [];

        for (const server of this.props.servers.listing) {
            let isFavorite = false;
            if (this.props.servers.favoriteServers.size) {
                isFavorite = this.props.servers.favoriteServers.has(server.guid);
            }

            servers.push(
                <ServerEntry
                    server={server}
                    key={server.guid}
                    expanded={this.state.expandedServer === server.guid}
                    onClick={this._onExpandServer}
                    onJoin={this._onJoinServer}
                    onSpectate={this._onSpectateServer}
                    onAddRemoveFavorite={this._onAddRemoveFavorite}
                    isFavorite={isFavorite}
                />
            );
        }

        let serverCountText = 'Found ' + servers.length + ' server' + (servers.length !== 1 ? 's' : '');

        if (servers.length === 0)
            servers = <span className="notice no-servers">No servers found</span>;

        if (this.props.servers.fetchStatus === ServerFetchStatus.FETCHING)
            serverCountText = 'Fetching Servers';

        let sortIcon = '';

        if (this.props.servers.sortDirection === SortDirection.ASC)
            sortIcon = <svg class="sort-indicator" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m280-400 200-200 200 200H280Z"/></svg>;
        else if (this.props.servers.sortDirection === SortDirection.DESC)
            sortIcon = <svg class="sort-indicator" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-360 280-560h400L480-360Z"/></svg>;

        const mapSort = this.props.servers.sortBy === ServerSort.MAP ? sortIcon : '';
        const gamemodeSort = this.props.servers.sortBy === ServerSort.GAMEMODE ? sortIcon : '';
        const playersSort = this.props.servers.sortBy === ServerSort.PLAYERS ? sortIcon : '';
        const pingSort = this.props.servers.sortBy === ServerSort.PING ? sortIcon : '';

        let listClassName = 'list-body main-list-body';

        const compactView = this.props.user.accountStorage[AccountStorageKeys.COMPACT_VIEW] === 'true';
        if (compactView) {
            listClassName += ' compact';
        }

        const favoritesOnly = this.props.servers.favoriteServersOnly;

        return (
            <div className="server-browser content-wrapper" ref={this.browserRef}>
                <div className="server-list">
                    <div className="list-header" ref={this.headerRef}>
                        <div className="column column-1">
                            <div className="header-action" onClick={this.onFetchServers.bind(this)}>
                                <span>{serverCountText}</span>
                                <a href="#"
                                    className={this.props.servers.fetchStatus === ServerFetchStatus.FETCHING ? 'fetching' : ''}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z" /></svg>
                                </a>
                            </div>
                            <div id="filters_visible" className={"header-action" + (this.state.filtersVisible ? ' active' : '') + (this._hasFilterApplied() ? ' hasFilter' : '')}>
                                <span onClick={this.onEditFilters.bind(this)}>Filters</span>
                                <a href="#" onClick={this.onEditFilters.bind(this)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" /></svg>
                                </a>
                                <ServerFilters visible={this.state.filtersVisible} onClose={this._onCloseFilters} />
                            </div>
                            <div className={"header-action compact" + (compactView ? ' active' : '')} onClick={this.onToggleCompactView.bind(this)}>
                                <span>Compact view</span>
                                <a href="#">
                                    {compactView ?
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z" /></svg> :
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z" /></svg>
                                    }
                                </a>
                            </div>
                            <div className={"header-action compact" + (favoritesOnly ? ' active' : '')} onClick={this.onToggleFavoritesOnly.bind(this)}>
                                <span>Favorites</span>
                                <a href="#">
                                    {favoritesOnly ?
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z" /></svg> :
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z" /></svg>
                                    }
                                </a>
                            </div>
                        </div>
                        <div className="column column-2 sort-action" onClick={this._onSortByMap}>
                            <span>Map</span>
                            {mapSort}
                        </div>
                        <div className="column column-3 sort-action" onClick={this._onSortByGamemode}>
                            <i className="sort-indicator" /><span>Gamemode</span><i className="sort-indicator material-icons">{gamemodeSort}</i>
                        </div>
                        <div className="column column-4 sort-action" onClick={this._onSortByPlayers}>
                            <i className="sort-indicator" /><span>Players</span><i className="sort-indicator material-icons">{playersSort}</i>
                        </div>
                        <div className="column column-5 sort-action" onClick={this._onSortByPing}>
                            <i className="sort-indicator" /><span>Ping</span><i className="sort-indicator material-icons">{pingSort}</i>
                        </div>
                    </div>
                    <div className={listClassName} style={{ overflowX: 'hidden', width: this.state.width, height: this.state.height }} ref={this._onServerList} >
                        {servers}
                    </div>
                </div>
            </div>
        );
    }

    _hasFilterApplied = () => {
        if (this.props.filters === null)
            return false;

        return JSON.stringify(this.props.filters) !== JSON.stringify(ServerFilters.getDefaultFilters());
    }

    _onCloseFilters = () => {
        this.setState({ filtersVisible: false });
    }

    onFetchServers(e) {
        if (e)
            e.preventDefault();

        this.setState({ expandedServer: null });

        if (this.props.servers.fetchStatus === ServerFetchStatus.FETCHING) {
            this.props.onResetServerFetch();
            return;
        }

        WebUI.Call('FetchServers');
    }

    onEditFilters(e) {
        if (e)
            e.preventDefault();

        this.setState({ filtersVisible: !this.state.filtersVisible });
    }

    onToggleCompactView(e) {
        if (e)
            e.preventDefault();

        this.props.toggleCompactView();
    }

    onToggleFavoritesOnly(e) {
        if (e)
            e.preventDefault();

        this.props.toggleFavoritesOnly();
    }

    _onExpandServer = (guid) => {
        this.setState({ expandedServer: guid });
    };

    _onJoinServer = (guid, password) => {
        if (this.props.servers.connectStatus === ServerConnectStatus.CONNECTING)
            return;

        this.props.setConnectionStatus();
        this.props.setPopup(<ConnectingServerPopup />);

        if (password && password.length > 0) {
            setTimeout(function () { WebUI.Call('ConnectToServer', guid, password); }, 500);
            return;
        }

        setTimeout(function () { WebUI.Call('ConnectToServer', guid); }, 500);
    };

    _onSpectateServer = (guid, password) => {
        if (this.props.servers.connectStatus === ServerConnectStatus.CONNECTING)
            return;

        this.props.setConnectionStatus();
        this.props.setPopup(<ConnectingServerPopup />);

        if (password && password.length > 0) {
            setTimeout(function () { WebUI.Call('SpectateServer', guid, password); }, 500);
            return;
        }

        setTimeout(function () { WebUI.Call('SpectateServer', guid); }, 500);
    };

    _onAddRemoveFavorite = (server, isFavorite) => {
        if (isFavorite) {
            this.props.removeFavorite(server);
            return;
        }

        this.props.addFavorite(server);
    };

    componentDidMount() {
        this.props.disableBlur();
        this.props.enableMenu();

        window.addEventListener('resize', this._onResize);
        window.addEventListener('click', this._onHandleClickOutsideOfFiltersBox);

        setTimeout(this._onResize, 0);

        // Fetch servers on page mount.
        this.onFetchServers();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('click', this._onHandleClickOutsideOfFiltersBox);
    }

    _onResize = () => {
        if (!this.browserRef.current || !this.headerRef.current) {
            return;
        }

        const browserStyle = window.getComputedStyle(this.browserRef.current);
        const headerStyle = window.getComputedStyle(this.headerRef.current);

        let requiredHeight = this.browserRef.current.clientHeight;
        let requiredWidth = this.headerRef.current.clientWidth;

        requiredHeight -= parseFloat(browserStyle.paddingTop);
        requiredHeight -= parseFloat(browserStyle.paddingBottom);
        requiredHeight -= parseFloat(headerStyle.height);

        this.setState({
            width: requiredWidth,
            height: requiredHeight,
        });
    };

    _onHandleClickOutsideOfFiltersBox = (e) => {
        if (!this.state.filtersVisible)
            return;

        let clickedInside = false;
        for (const element of e.path) {
            if (element.classList && (element.classList.contains('server-filters') || element.id === 'filters_visible')) {
                clickedInside = true;
                break;
            }
        }

        if (!clickedInside) {
            this.setState({ filtersVisible: false });
        }
    }
}

const mapStateToProps = (state) => {
    return {
        base: state.base,
        servers: state.servers,
        user: state.user,
        filters: state.servers.filters,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onResetServerFetch: () => {
            dispatch({ type: ActionTypes.CHANGE_SERVER_FETCH_STATUS, status: ServerFetchStatus.IDLE });
        },
        disableBlur: () => {
            dispatch({ type: ActionTypes.SET_BLUR, blur: false });
        },
        enableMenu: () => {
            dispatch({ type: ActionTypes.SET_MENU, menu: true });
        },
        setConnectionStatus: () => {
            dispatch({ type: ActionTypes.CHANGE_SERVER_CONNECT_STATUS, status: ServerConnectStatus.CONNECTING });
        },
        setPopup: (popup) => {
            dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
        },
        sortServersBy: (sortBy, sortDirection) => {
            dispatch({ type: ActionTypes.SORT_SERVERS_BY, sortBy, sortDirection });
        },
        cycleServerSortDirection: () => {
            dispatch({ type: ActionTypes.CYCLE_SERVER_SORT_DIRECTION });
        },
        toggleCompactView: () => dispatch((innerDispatch, getState) => {
            const key = AccountStorageKeys.COMPACT_VIEW;
            const boolValue = !(getState().user.accountStorage[key] === 'true');

            innerDispatch({
                type: ActionTypes.SET_ACCOUNT_STORAGE_VALUE,
                key,
                value: boolValue.toString(),
            });
        }),
        toggleFavoritesOnly: () => {
            dispatch({ type: ActionTypes.TOGGLE_FAVORITE_SERVERS_ONLY });
        },
        addFavorite: (server) => {
            dispatch({ type: ActionTypes.ADD_FAVORITE_SERVER, server });
        },
        removeFavorite: (server) => {
            dispatch({ type: ActionTypes.REMOVE_FAVORITE_SERVER, server });
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ServerBrowser);
