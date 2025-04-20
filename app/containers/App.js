import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import preloader from 'preloader';

import * as ActionTypes from '../constants/ActionTypes';

import TopMenu from '../components/TopMenu';
import AnimatedBackground from '../components/AnimatedBackground';
import TopLeftActions from '../components/TopLeftActions';
import TopRightActions from '../components/TopRightActions';
import GameConsole from '../components/GameConsole';

import QuitConfirmationPopup from '../popups/QuitConfirmationPopup';
import LogoutQuitConfirmationPopup from '../popups/LogoutQuitConfirmationPopup';
import Watermark from '../components/Watermark';
import SettingsPopup from '../popups/SettingsPopup';
import GlobalNotice from '../components/GlobalNotice';

export default function App(props) {
    const base = useSelector((state) => state.base);
    const settings = useSelector((state) => state.settings);
    const dispatch = useDispatch();

    const [preloaderInstance] = useState(() =>
        preloader({
            xhrImages: false,
            loadFullAudio: false,
            loadFullVideo: false,
        }),
    );
    useEffect(() => {
        preloaderInstance.on('complete', () => {
            WebUI.Call('Startup');
            setTimeout(() => {
                WebUI.Call('InitialConnect');
            }, 2500);
        });

        // Preload all resources.
        preloaderInstance.add('/assets/fonts/blinker-bold-webfont.woff2');
        preloaderInstance.add('/assets/fonts/blinker-regular-webfont.woff2');
        preloaderInstance.add('/assets/fonts/blinker-semibold-webfont.woff2');
        preloaderInstance.add('/assets/fonts/blinker-semilight-webfont.woff2');

        preloaderInstance.add('/assets/fonts/JetBrainsMono-Bold.woff2');
        preloaderInstance.add('/assets/fonts/JetBrainsMono-Regular.woff2');

        preloaderInstance.add('/assets/fonts/MaterialIcons-Regular.ttf');

        preloaderInstance.add('/assets/img/background.png');
        preloaderInstance.add('/assets/img/logo.svg');
        preloaderInstance.add('/assets/img/logo-outline.svg');
        preloaderInstance.add('/assets/img/matchmake-bg.png');
        preloaderInstance.add('/assets/img/news-bg.png');
        preloaderInstance.add('/assets/img/news-secondary-bg.png');
        preloaderInstance.add('/assets/img/soldier-bg.png');

        preloaderInstance.add('/assets/img/maps/MP_001.png');
        preloaderInstance.add('/assets/img/maps/MP_003.png');
        preloaderInstance.add('/assets/img/maps/MP_007.png');
        preloaderInstance.add('/assets/img/maps/MP_011.png');
        preloaderInstance.add('/assets/img/maps/MP_012.png');
        preloaderInstance.add('/assets/img/maps/MP_013.png');
        preloaderInstance.add('/assets/img/maps/MP_017.png');
        preloaderInstance.add('/assets/img/maps/MP_018.png');
        preloaderInstance.add('/assets/img/maps/MP_Subway.png');
        preloaderInstance.add('/assets/img/maps/XP1_001.png');
        preloaderInstance.add('/assets/img/maps/XP1_002.png');
        preloaderInstance.add('/assets/img/maps/XP1_003.png');
        preloaderInstance.add('/assets/img/maps/XP1_004.png');
        preloaderInstance.add('/assets/img/maps/XP2_Factory.png');
        preloaderInstance.add('/assets/img/maps/XP2_Office.png');
        preloaderInstance.add('/assets/img/maps/XP2_Palace.png');
        preloaderInstance.add('/assets/img/maps/XP2_Skybar.png');
        preloaderInstance.add('/assets/img/maps/XP3_Desert.png');
        preloaderInstance.add('/assets/img/maps/XP3_Alborz.png');
        preloaderInstance.add('/assets/img/maps/XP3_Shield.png');
        preloaderInstance.add('/assets/img/maps/XP3_Valley.png');
        preloaderInstance.add('/assets/img/maps/XP4_FD.png');
        preloaderInstance.add('/assets/img/maps/XP4_Parl.png');
        preloaderInstance.add('/assets/img/maps/XP4_Quake.png');
        preloaderInstance.add('/assets/img/maps/XP4_Rubble.png');
        preloaderInstance.add('/assets/img/maps/XP5_001.png');
        preloaderInstance.add('/assets/img/maps/XP5_002.png');
        preloaderInstance.add('/assets/img/maps/XP5_003.png');
        preloaderInstance.add('/assets/img/maps/XP5_004.png');

        preloaderInstance.load();

        return () => {
            preloaderInstance.off('complete');
        };
    }, [preloaderInstance]);

    useEffect(() => {
        const inputTimeout = setInterval(() => {
            if (base.ingame) return;

            WebUI.Call('EnableMouse');
            WebUI.Call('EnableKeyboard');
        }, 500);

        return () => {
            clearInterval(inputTimeout);
        };
    }, [base.ingame]);

    const setPopup = (popup) => {
        dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
    };

    const onQuit = () => {
        setPopup(<QuitConfirmationPopup />);
    };

    const onLogoutQuit = () => {
        setPopup(<LogoutQuitConfirmationPopup />);
    };

    let topMenu = null;

    if (base.hasMenu) topMenu = <TopMenu />;

    let popup = null;

    if (base.popup !== null) {
        popup = <div className="popup-container">{base.popup}</div>;
    }

    let mainContainers = <Watermark build={base.build} />;

    if (base.initialized && !base.ingame) {
        mainContainers = (
            <>
                <AnimatedBackground />
                <div id="app-container" className={base.hasBlur ? 'has-blur' : ''}>
                    <div className="top-bar">
                        <TopLeftActions onQuit={onQuit} onLogoutQuit={onLogoutQuit} />
                        {topMenu}
                        <TopRightActions />
                    </div>
                    {props.children}
                    <div id="build-info">{base.build !== null ? 'Build #' + base.build : 'Unknown Build'}</div>
                </div>
                {popup}
            </>
        );
    } else if (base.initialized && settings.showPopup) {
        mainContainers = (
            <>
                <AnimatedBackground />
                <div id="app-container">
                    <SettingsPopup />
                </div>
            </>
        );
    }

    let globalNotice = null;

    if (base.globalNotice !== null) {
        const noticeText = base.globalNotice.toString().trim();

        if (noticeText.length > 0) {
            globalNotice = <GlobalNotice notice={noticeText} />;
        }
    }

    return (
        <div id="ui-app">
            {mainContainers}
            {/* <GameConsole/> TODO: Re-enable later */}
            {globalNotice}
        </div>
    );
}
