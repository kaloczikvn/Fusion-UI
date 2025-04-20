import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PerfectScrollbar from 'perfect-scrollbar';

import * as ServerFetchStatus from '../constants/ServerFetchStatus';
import * as ServerConnectStatus from '../constants/ServerConnectStatus';
import * as ActionTypes from '../constants/ActionTypes';
import * as AccountStorageKeys from '../constants/AccountStorageKeys';
import * as ServerSort from '../constants/ServerSort';
import * as SortDirection from '../constants/SortDirection';

import ConnectingServerPopup from '../popups/ConnectingServerPopup';
import ServerEntry from '../components/ServerEntry';
import ServerFilters from '../components/ServerFilters';

export default function ServerBrowser() {
    const [expandedServer, setExpandedServer] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [width, setWidth] = useState(920);
    const [height, setHeight] = useState(580);

    const scrollbarRef = useRef(null);
    const browserRef = useRef(null);
    const headerRef = useRef(null);

    const base = useSelector((state) => state.base);
    const servers = useSelector((state) => state.servers);
    const user = useSelector((state) => state.user);
    const filters = useSelector((state) => state.servers.filters);

    const dispatch = useDispatch();

    const onResetServerFetch = () => {
        dispatch({
            type: ActionTypes.CHANGE_SERVER_FETCH_STATUS,
            status: ServerFetchStatus.IDLE,
        });
    };

    const disableBlur = () => {
        dispatch({ type: ActionTypes.SET_BLUR, blur: false });
    };

    const enableMenu = () => {
        dispatch({ type: ActionTypes.SET_MENU, menu: true });
    };

    const setConnectionStatus = () => {
        dispatch({
            type: ActionTypes.CHANGE_SERVER_CONNECT_STATUS,
            status: ServerConnectStatus.CONNECTING,
        });
    };

    const setPopup = (popup) => {
        dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
    };

    const sortServersBy = (sortBy, sortDirection) => {
        dispatch({ type: ActionTypes.SORT_SERVERS_BY, sortBy, sortDirection });
    };

    const cycleServerSortDirection = () => {
        dispatch({ type: ActionTypes.CYCLE_SERVER_SORT_DIRECTION });
    };

    const toggleCompactView = () =>
        dispatch((innerDispatch, getState) => {
            const key = AccountStorageKeys.COMPACT_VIEW;
            const boolValue = !(getState().user.accountStorage[key] === 'true');

            innerDispatch({
                type: ActionTypes.SET_ACCOUNT_STORAGE_VALUE,
                key,
                value: boolValue.toString(),
            });
        });

    const toggleFavoritesOnly = () => {
        dispatch({ type: ActionTypes.TOGGLE_FAVORITE_SERVERS_ONLY });
    };

    const addFavorite = (server) => {
        dispatch({ type: ActionTypes.ADD_FAVORITE_SERVER, server });
    };

    const removeFavorite = (server) => {
        dispatch({ type: ActionTypes.REMOVE_FAVORITE_SERVER, server });
    };

    const _onSortByMap = (e) => {
        if (e) e.preventDefault();

        sortBy(ServerSort.MAP);
    };

    const _onSortByGamemode = (e) => {
        if (e) e.preventDefault();

        sortBy(ServerSort.GAMEMODE);
    };

    const _onSortByPlayers = (e) => {
        if (e) e.preventDefault();

        sortBy(ServerSort.PLAYERS);
    };

    const _onSortByPing = (e) => {
        if (e) e.preventDefault();

        sortBy(ServerSort.PING);
    };

    const sortBy = (sortBy) => {
        if (servers.sortBy !== sortBy) {
            sortServersBy(sortBy, SortDirection.ASC);
            return;
        }

        cycleServerSortDirection();
    };

    const _onServerList = (ref) => {
        if (ref === null) {
            scrollbarRef.current = null;
            return;
        }

        scrollbarRef.current = new PerfectScrollbar(ref, {
            wheelSpeed: 3,
            suppressScrollX: true,
        });
    };

    const _hasFilterApplied = () => {
        if (filters === null) return false;

        return JSON.stringify(filters) !== JSON.stringify(ServerFilters.getDefaultFilters());
    };

    const _onCloseFilters = () => {
        setFiltersVisible(false);
    };

    const onFetchServers = (e) => {
        if (e) e.preventDefault();

        setExpandedServer(null);

        if (servers.fetchStatus === ServerFetchStatus.FETCHING) {
            onResetServerFetch();
            return;
        }

        WebUI.Call('FetchServers');
    };

    const onEditFilters = (e) => {
        if (e) e.preventDefault();

        setFiltersVisible(!filtersVisible);
    };

    const onToggleCompactView = (e) => {
        if (e) e.preventDefault();

        toggleCompactView();
    };

    const onToggleFavoritesOnly = (e) => {
        if (e) e.preventDefault();

        toggleFavoritesOnly();
    };

    const _onExpandServer = (guid) => {
        setExpandedServer(guid);
    };

    const _onJoinServer = (guid, password) => {
        if (servers.connectStatus === ServerConnectStatus.CONNECTING) return;

        setConnectionStatus();
        setPopup(<ConnectingServerPopup />);

        if (password && password.length > 0) {
            setTimeout(function () {
                WebUI.Call('ConnectToServer', guid, password);
            }, 500);
            return;
        }

        setTimeout(function () {
            WebUI.Call('ConnectToServer', guid);
        }, 500);
    };

    const _onSpectateServer = (guid, password) => {
        if (servers.connectStatus === ServerConnectStatus.CONNECTING) return;

        setConnectionStatus();
        setPopup(<ConnectingServerPopup />);

        if (password && password.length > 0) {
            setTimeout(function () {
                WebUI.Call('SpectateServer', guid, password);
            }, 500);
            return;
        }

        setTimeout(function () {
            WebUI.Call('SpectateServer', guid);
        }, 500);
    };

    const _onAddRemoveFavorite = (server, isFavorite) => {
        if (isFavorite) {
            removeFavorite(server);
            return;
        }

        addFavorite(server);
    };

    const _onResize = () => {
        if (!browserRef.current || !headerRef.current) {
            return;
        }

        const browserStyle = window.getComputedStyle(browserRef.current);
        const headerStyle = window.getComputedStyle(headerRef.current);

        let requiredHeight = browserRef.current.clientHeight;
        let requiredWidth = headerRef.current.clientWidth;

        requiredHeight -= parseFloat(browserStyle.paddingTop);
        requiredHeight -= parseFloat(browserStyle.paddingBottom);
        requiredHeight -= parseFloat(headerStyle.height);

        setWidth(requiredWidth);
        setHeight(requiredHeight);
    };

    const _onHandleClickOutsideOfFiltersBox = (e) => {
        if (!filtersVisible) return;

        let clickedInside = false;
        for (const element of e.path) {
            if (
                element.classList &&
                (element.classList.contains('server-filters') || element.id === 'filters_visible')
            ) {
                clickedInside = true;
                break;
            }
        }

        if (!clickedInside) {
            setFiltersVisible(false);
        }
    };

    useEffect(() => {
        disableBlur();
        enableMenu();

        window.addEventListener('resize', _onResize);
        window.addEventListener('click', _onHandleClickOutsideOfFiltersBox);

        setTimeout(_onResize, 0);

        // Fetch servers on page mount.
        onFetchServers();

        return () => {
            window.removeEventListener('resize', _onResize);
            window.removeEventListener('click', _onHandleClickOutsideOfFiltersBox);
        };
    }, []);

    useEffect(() => {
        if (scrollbarRef.current !== null) scrollbarRef.current.update();
    });

    let serversList = [];

    for (const server of servers.listing) {
        let isFavorite = false;
        if (servers.favoriteServers.size) {
            isFavorite = servers.favoriteServers.has(server.guid);
        }

        serversList.push(
            <ServerEntry
                server={server}
                key={server.guid}
                expanded={expandedServer === server.guid}
                onClick={_onExpandServer}
                onJoin={_onJoinServer}
                onSpectate={_onSpectateServer}
                onAddRemoveFavorite={_onAddRemoveFavorite}
                isFavorite={isFavorite}
            />,
        );
    }

    let serverCountText = 'Found ' + serversList.length + ' server' + (serversList.length !== 1 ? 's' : '');

    if (serversList.length === 0) serversList = <span className="notice no-servers">No servers found</span>;

    if (servers.fetchStatus === ServerFetchStatus.FETCHING) serverCountText = 'Fetching Servers';

    let sortIcon = '';

    if (servers.sortDirection === SortDirection.ASC)
        sortIcon = (
            <svg
                class="sort-indicator"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
            >
                <path d="m280-400 200-200 200 200H280Z" />
            </svg>
        );
    else if (servers.sortDirection === SortDirection.DESC)
        sortIcon = (
            <svg
                class="sort-indicator"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
            >
                <path d="M480-360 280-560h400L480-360Z" />
            </svg>
        );

    const mapSort = servers.sortBy === ServerSort.MAP ? sortIcon : '';
    const gamemodeSort = servers.sortBy === ServerSort.GAMEMODE ? sortIcon : '';
    const playersSort = servers.sortBy === ServerSort.PLAYERS ? sortIcon : '';
    const pingSort = servers.sortBy === ServerSort.PING ? sortIcon : '';

    let listClassName = 'list-body main-list-body';

    const compactView = user.accountStorage[AccountStorageKeys.COMPACT_VIEW] === 'true';
    if (compactView) {
        listClassName += ' compact';
    }

    const favoritesOnly = servers.favoriteServersOnly;

    return (
        <div className="server-browser content-wrapper" ref={browserRef}>
            <div className="server-list">
                <div className="list-header" ref={headerRef}>
                    <div className="column column-1">
                        <div className="header-action" onClick={onFetchServers}>
                            <span>{serverCountText}</span>
                            <a
                                href="#"
                                className={servers.fetchStatus === ServerFetchStatus.FETCHING ? 'fetching' : ''}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#e8eaed"
                                >
                                    <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z" />
                                </svg>
                            </a>
                        </div>
                        <div
                            id="filters_visible"
                            className={
                                'header-action' +
                                (filtersVisible ? ' active' : '') +
                                (_hasFilterApplied() ? ' hasFilter' : '')
                            }
                        >
                            <span onClick={onEditFilters}>Filters</span>
                            <a href="#" onClick={onEditFilters}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#e8eaed"
                                >
                                    <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" />
                                </svg>
                            </a>
                            <ServerFilters visible={filtersVisible} onClose={_onCloseFilters} />
                        </div>
                        <div
                            className={'header-action compact' + (compactView ? ' active' : '')}
                            onClick={onToggleCompactView}
                        >
                            <span>Compact view</span>
                            <a href="#">
                                {compactView ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#e8eaed"
                                    >
                                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#e8eaed"
                                    >
                                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z" />
                                    </svg>
                                )}
                            </a>
                        </div>
                        <div
                            className={'header-action compact' + (favoritesOnly ? ' active' : '')}
                            onClick={onToggleFavoritesOnly}
                        >
                            <span>Favorites</span>
                            <a href="#">
                                {favoritesOnly ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#e8eaed"
                                    >
                                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#e8eaed"
                                    >
                                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z" />
                                    </svg>
                                )}
                            </a>
                        </div>
                    </div>
                    <div className="column column-2 sort-action" onClick={_onSortByMap}>
                        <span>Map</span>
                        {mapSort}
                    </div>
                    <div className="column column-3 sort-action" onClick={_onSortByGamemode}>
                        <span>Gamemode</span>
                        {gamemodeSort}
                    </div>
                    <div className="column column-4 sort-action" onClick={_onSortByPlayers}>
                        <span>Players</span>
                        {playersSort}
                    </div>
                    <div className="column column-5 sort-action" onClick={_onSortByPing}>
                        <span>Ping</span>
                        {pingSort}
                    </div>
                </div>
                <div
                    className={listClassName}
                    style={{
                        overflowX: 'hidden',
                        width: width,
                        height: height,
                    }}
                    ref={_onServerList}
                >
                    {serversList}
                </div>
            </div>
        </div>
    );
}
