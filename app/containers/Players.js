import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as PlayerCreateStatus from '../constants/PlayerCreateStatus';
import * as PlayerDeleteStatus from '../constants/PlayerDeleteStatus';
import * as PlayerLoginStatus from '../constants/PlayerLoginStatus';
import * as ActionTypes from '../constants/ActionTypes';

import LoggingPlayerPopup from '../popups/LoggingPlayerPopup';
import CreatePlayerPopup from '../popups/CreatePlayerPopup';
import PlayerDeleteConfirmationPopup from '../popups/PlayerDeleteConfirmationPopup';

import SoldierEntry from '../components/SoldierEntry';

export default function Players() {
    const base = useSelector((state) => state.base);
    const user = useSelector((state) => state.user);

    const dispatch = useDispatch();

    const onResetPlayerCreate = (e) => {
        if (e) e.preventDefault();

        dispatch({
            type: ActionTypes.CHANGE_PLAYER_CREATE_STATUS,
            status: PlayerCreateStatus.NO_STATUS,
        });
    };

    const onResetPlayerDelete = (e) => {
        if (e) e.preventDefault();

        dispatch({
            type: ActionTypes.CHANGE_PLAYER_DELETE_STATUS,
            status: PlayerDeleteStatus.NO_STATUS,
        });
    };

    const onResetPlayerLogin = (e) => {
        if (e) e.preventDefault();

        dispatch({
            type: ActionTypes.CHANGE_PLAYER_LOGIN_STATUS,
            status: PlayerLoginStatus.LOGGED_OUT,
        });
    };

    const onSetPlayerCreate = () => {
        dispatch({
            type: ActionTypes.CHANGE_PLAYER_CREATE_STATUS,
            status: PlayerCreateStatus.CREATION_INIT,
        });
    };

    const onSetPlayerDelete = () => {
        dispatch({
            type: ActionTypes.CHANGE_PLAYER_DELETE_STATUS,
            status: PlayerDeleteStatus.DELETING,
        });
    };

    const onSetPlayerLogin = () => {
        dispatch({
            type: ActionTypes.CHANGE_PLAYER_LOGIN_STATUS,
            status: PlayerLoginStatus.LOGGING_IN,
        });
    };

    const enableBlur = () => {
        dispatch({ type: ActionTypes.SET_BLUR, blur: true });
    };

    const disableMenu = () => {
        dispatch({ type: ActionTypes.SET_MENU, menu: false });
    };

    const setPopup = (popup) => {
        dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
    };

    const onDeletePlayer = (name, guid, e) => {
        if (e) e.preventDefault();

        onSetPlayerDelete();
        setPopup(<PlayerDeleteConfirmationPopup name={name} guid={guid} />);
    };

    const onLoginPlayer = (guid, e) => {
        if (e) e.preventDefault();

        onSetPlayerLogin();
        setPopup(<LoggingPlayerPopup />);

        WebUI.Call('LoginPlayer', guid);
    };

    const onCreatePlayer = (e) => {
        if (e) e.preventDefault();

        onSetPlayerCreate();
        setPopup(<CreatePlayerPopup />);
    };

    useEffect(() => {
        enableBlur();
        disableMenu();

        return () => {
            setPopup(null);
        };
    }, []);

    // Handle player creation.
    let players = [];

    for (let i = 0; i < user.players.length; ++i) {
        players.push(
            <SoldierEntry
                key={user.players[i].guid}
                name={user.players[i].name}
                actions={[
                    {
                        icon: 'exit_to_app',
                        callback: (e) => {
                            onLoginPlayer(user.players[i].guid, e);
                        },
                    },
                ]}
                deleteCallback={(e) => {
                    onDeletePlayer(user.players[i].name, user.players[i].guid, e);
                }}
                title="Soldier"
            />,
        );
    }

    let playerCount = players.length;

    for (let i = 0; i < 4 - playerCount; ++i) {
        players.push(
            <SoldierEntry
                key={'create-' + i}
                actions={[
                    {
                        icon: 'library_add',
                        callback: (e) => {
                            onCreatePlayer(e);
                        },
                    },
                ]}
                title="Create new Soldier"
                className="empty"
            />,
        );
    }

    return <div className="soldier-listing">{players}</div>;
}
