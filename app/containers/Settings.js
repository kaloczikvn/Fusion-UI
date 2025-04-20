import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import PerfectScrollbar from 'perfect-scrollbar';

import * as ActionTypes from '../constants/ActionTypes';
import ApplySettingsPopup from '../popups/ApplySettingsPopup';
import { SELECT_STYLE } from '../constants/Styles';
import TextInput from '../components/inputs/TextInput';
import BoolInput from '../components/inputs/BoolInput';
import NumberInput from '../components/inputs/NumberInput';
import KeybindInput from '../components/inputs/KeybindInput';
import OptionsInput from '../components/inputs/OptionsInput';
import MultiKeybindInput from '../components/inputs/MultiKeybindInput';
import { BOOL, NUMBER, KEYBIND, MULTI_KEYBIND, STRING, OPTION } from '../constants/ModSettingType';
import AudioSettings from './AudioSettings';

export default function Settings() {
    const [modName, setModName] = useState('');

    const modListScrollbarRef = useRef(null);
    const modSettingsScrollbarRef = useRef(null);

    const base = useSelector((state) => state.base);
    const settings = useSelector((state) => state.settings);
    const voip = useSelector((state) => state.voip);
    const popup = useSelector((state) => state.base.popup);

    const dispatch = useDispatch();

    const disableBlur = () => {
        dispatch({ type: ActionTypes.SET_BLUR, blur: false });
    };

    const enableMenu = () => {
        dispatch({ type: ActionTypes.SET_MENU, menu: true });
    };

    const setPopup = (popup) => {
        dispatch({ type: ActionTypes.SET_POPUP, popup: popup });
    };

    const setResolutionIndex = (index) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { selectedResolution: index },
        });
    };

    const setScreenIndex = (index) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { selectedScreen: index },
        });
    };

    const setFullscreen = (fullscreen) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { fullscreen },
        });
    };

    const hideSettingsPopup = () => {
        dispatch({ type: ActionTypes.SHOW_SETTINGS_POPUP, show: false });
    };

    const setSettingsTab = (tab) => {
        dispatch({ type: ActionTypes.SET_SETTINGS_TAB, tab: tab });
    };

    const setSettingsSelectedMod = (selectedMod) => {
        dispatch({
            type: ActionTypes.SET_SETTINGS_SELECTED_MOD,
            selectedMod: selectedMod,
        });
    };

    const setSettingValue = (modSettings, selectedMod, settingKey, value) => {
        let newSettings = {
            ...modSettings,
            [selectedMod]: {
                ...modSettings[selectedMod],
                [settingKey]: {
                    ...modSettings[selectedMod][settingKey],
                    currentValue: value,
                },
            },
        };
        dispatch({ type: ActionTypes.SET_MOD_SETTINGS, settings: newSettings });
    };

    const setSettings = (newSettings) => {
        dispatch({ type: ActionTypes.SET_MOD_SETTINGS, settings: newSettings });
    };

    const _onChangeModInput = (settingKey, value) => {
        setSettingValue(settings.modSettings, settings.selectedMod, settingKey, value);
    };

    const _onChangeModName = (e) => {
        if (modListScrollbarRef.current) {
            modListScrollbarRef.current.update();
            modListScrollbarRef.current.element.scrollTop = 0;
        }
        setModName(e.target.value);
    };

    const _onSelectMod = (mod) => {
        if (modSettingsScrollbarRef.current) {
            modSettingsScrollbarRef.current.update();
            modSettingsScrollbarRef.current.element.scrollTop = 0;
        }
        setSettingsSelectedMod(mod);
    };

    const _onModList = (ref) => {
        if (ref === null) {
            modListScrollbarRef.current = null;
            return;
        }

        modListScrollbarRef.current = new PerfectScrollbar(ref, {
            wheelSpeed: 1,
        });
    };

    const _onModSettings = (ref) => {
        if (ref === null) {
            modSettingsScrollbarRef.current = null;
            return;
        }

        modSettingsScrollbarRef.current = new PerfectScrollbar(ref, {
            wheelSpeed: 3,
            suppressScrollX: true,
        });
    };

    const _isTabActive = (tab) => {
        if (tab === settings.tab) {
            return 'tab active';
        }
        return 'tab';
    };

    const _onApplySettings = (e) => {
        if (e) e.preventDefault();

        WebUI.Call('ApplySettings', settings.currentSettings);

        // For mod settings:
        // WebUI.Call('SetModSettingBool', modName: string, settingName: string, value: boolean);
        // WebUI.Call('SetModSettingNumber', modName: string, settingName: string, value: number);
        // WebUI.Call('SetModSettingKeybind', modName: string, settingName: string, value: number);
        // WebUI.Call('SetModSettingMultiKeybind', modName: string, settingName: string, value: number[]);
        // WebUI.Call('SetModSettingString', modName: string, settingName: string, value: string);
        // WebUI.Call('SetModSettingOption', modName: string, settingName: string, value: string | null);

        Object.entries(settings.modSettings).forEach((mod) => {
            const modName = mod[0];
            Object.entries(mod[1]).forEach((setting) => {
                const settingName = setting[0];
                const value = setting[1].currentValue;
                if (value === undefined) {
                    return;
                }

                switch (setting[1].type) {
                    case BOOL:
                        WebUI.Call('SetModSettingBool', modName, settingName, value);
                        break;
                    case NUMBER:
                        WebUI.Call('SetModSettingNumber', modName, settingName, value);
                        break;
                    case KEYBIND:
                        WebUI.Call('SetModSettingKeybind', modName, settingName, value);
                        break;
                    case MULTI_KEYBIND:
                        WebUI.Call('SetModSettingMultiKeybind', modName, settingName, value); // TODO: Fixme
                        break;
                    case STRING:
                        WebUI.Call('SetModSettingString', modName, settingName, value);
                        break;
                    case OPTION:
                        WebUI.Call('SetModSettingOption', modName, settingName, value);
                        break;
                }
            });
        });

        if (popup) {
            hideSettingsPopup();
        } else {
            setPopup(<ApplySettingsPopup />);
        }
    };

    const _onResetSettings = (e) => {
        if (e) e.preventDefault();

        let newSettings = {
            ...settings.modSettings,
        };
        Object.entries(settings.modSettings).forEach((mod) => {
            const modName = mod[0];
            Object.entries(mod[1]).forEach((setting) => {
                const settingName = setting[0];
                const value = setting[1].currentValue;
                if (value !== undefined) {
                    newSettings = {
                        ...newSettings,
                        [modName]: {
                            ...newSettings[modName],
                            [settingName]: {
                                ...newSettings[modName][settingName],
                                currentValue: undefined,
                            },
                        },
                    };
                }
            });
        });
        setSettings(newSettings);

        WebUI.Call('RefreshSettings');
    };

    const _onDisplayModeChange = (displayMode) => {
        setFullscreen(displayMode.value);
    };

    const _onResolutionChange = (resolution) => {
        setResolutionIndex(resolution.value);
    };

    const _onScreenChange = (resolution) => {
        setScreenIndex(resolution.value);
    };

    useEffect(() => {
        WebUI.Call('RefreshSettings');
        WebUI.Call('SettingsActive');

        disableBlur();
        enableMenu();

        return () => {
            WebUI.Call('SettingsInactive');
        };
    }, []);

    useEffect(() => {
        if (modListScrollbarRef.current) {
            modListScrollbarRef.current.update();
        }
        if (modSettingsScrollbarRef.current) {
            modSettingsScrollbarRef.current.update();
        }
    });

    const renderModSetting = (settingKey, setting) => {
        switch (setting.type) {
            case BOOL:
                return (
                    <BoolInput
                        value={setting.currentValue ?? setting.value}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e.target.checked);
                        }}
                    />
                );
            case NUMBER:
                return (
                    <NumberInput
                        value={setting.currentValue ?? setting.value.value}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e);
                        }}
                        min={setting.value.min ?? 0}
                        max={setting.value.max ?? 100}
                    />
                );
            case KEYBIND:
                return (
                    <KeybindInput
                        value={setting.currentValue !== undefined ? setting.currentValue : setting.value}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e);
                        }}
                    />
                );
            case MULTI_KEYBIND:
                return (
                    <MultiKeybindInput
                        value={setting.currentValue ?? setting.value}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e);
                        }}
                    />
                );
            case STRING:
                return (
                    <TextInput
                        value={setting.currentValue ?? setting.value}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e.target.value);
                        }}
                    />
                );
            case OPTION:
                return (
                    <OptionsInput
                        value={setting.currentValue ?? setting.value.value}
                        options={setting.value.options}
                        allowEmpty={setting.allowEmpty}
                        onChange={(e) => {
                            _onChangeModInput(settingKey, e.value);
                        }}
                    />
                );
            default:
                return <div></div>;
        }
    };

    const renderActiveModSettings = () => {
        if (settings.selectedMod === '') {
            return <></>;
        }

        return (
            <>
                {Object.entries(settings.modSettings[settings.selectedMod])
                    .sort((settingA, settingB) => settingA[1].displayName.localeCompare(settingB[1].displayName))
                    .map((setting) => (
                        <div className="settings-row" key={setting[0]}>
                            <h3>{setting[1].displayName ?? ''}</h3>
                            {renderModSetting(setting[0], setting[1])}
                        </div>
                    ))}
            </>
        );
    };

    const renderActiveTab = () => {
        switch (settings.tab) {
            default:
            case 'game':
                return gameSettings;
            case 'mods':
                return modSettings;
        }
    };

    const fullscreenOptions = [];
    for (let i = 0; i < settings.currentSettings.resolutions[settings.currentSettings.selectedScreen].length; ++i) {
        const resolution = settings.currentSettings.resolutions[settings.currentSettings.selectedScreen][i];
        fullscreenOptions.push({ value: i, label: resolution });
    }

    const screenOptions = [];
    for (let i = 0; i < settings.currentSettings.screens; ++i) {
        screenOptions.push({ value: i, label: 'Monitor #' + (i + 1) });
    }

    const displayModeOptions = [
        { value: true, label: 'Exclusive Fullscreen' },
        { value: false, label: 'Windowed' },
    ];

    let gameSettings = (
        <div className="general-settings">
            <h2>Display settings</h2>
            <div className="settings-row">
                <h3>Display mode</h3>
                <Select
                    options={displayModeOptions}
                    isSearchable={false}
                    value={displayModeOptions[settings.currentSettings.fullscreen ? 0 : 1]}
                    onChange={_onDisplayModeChange}
                    styles={SELECT_STYLE}
                />
            </div>
            <div className="settings-row">
                <h3>Fullscreen resolution</h3>
                <Select
                    options={fullscreenOptions}
                    isSearchable={false}
                    value={fullscreenOptions[settings.currentSettings.selectedResolution]}
                    onChange={_onResolutionChange}
                    styles={SELECT_STYLE}
                />
            </div>
            <div className="settings-row">
                <h3>Fullscreen monitor</h3>
                <Select
                    options={screenOptions}
                    isSearchable={false}
                    value={screenOptions[settings.currentSettings.selectedScreen]}
                    onChange={_onScreenChange}
                    styles={SELECT_STYLE}
                />
            </div>
            <AudioSettings />
        </div>
    );

    let modSettings = (
        <div className="mod-settings-container">
            <div className="mod-search-bar">
                <TextInput value={modName} onChange={_onChangeModName} placeholder="Search..." />
            </div>
            <div className="mod-list" style={{ overflowX: 'hidden' }} ref={_onModList}>
                {Object.keys(settings.modSettings)
                    .filter((key) => {
                        return key.toLowerCase().search(modName.toLowerCase()) != -1;
                    })
                    .sort((a, b) => a.localeCompare(b))
                    .map((key) => (
                        <div
                            className={'mod' + (settings.selectedMod === key ? ' active' : '')}
                            key={key}
                            onClick={() => _onSelectMod(key)}
                        >
                            <span>{key ?? ''}</span>
                        </div>
                    ))}
            </div>
            {settings.selectedMod !== '' ? (
                <div className="mod-settings" style={{ overflowX: 'hidden' }} ref={_onModSettings}>
                    <h2>{settings.selectedMod}</h2>
                    <div className="settings-container">{renderActiveModSettings()}</div>
                </div>
            ) : (
                <div className="mod-settings no-mod">
                    <h3>No mod selected</h3>
                </div>
            )}
        </div>
    );

    let popupHeader = null;
    if (popup) {
        gameSettings = (
            <div className="general-settings">
                <AudioSettings />
            </div>
        );
    }

    return (
        <div className="settings content-wrapper">
            {popupHeader}
            <div className="tabs">
                <a className={_isTabActive('game')} onClick={() => setSettingsTab('game')}>
                    General settings
                </a>
                <a className={_isTabActive('mods')} onClick={() => setSettingsTab('mods')}>
                    Mod settings
                </a>
            </div>
            <div className="tab-inner">{renderActiveTab()}</div>
            <div className="settings-buttons">
                <a href="#" className="btn border-btn" onClick={_onResetSettings}>
                    Reset settings
                </a>
                <a href="#" className="btn border-btn primary" onClick={_onApplySettings}>
                    Apply settings
                </a>
            </div>
        </div>
    );
}
