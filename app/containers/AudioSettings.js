import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';

import * as ActionTypes from '../constants/ActionTypes';
import { SELECT_STYLE } from '../constants/Styles';
import VoipSlider from '../components/VoipSlider';
import Slider from '../components/Slider';
import NumberInput from '../components/inputs/NumberInput';

export default function AudioSettings() {
    const settings = useSelector((state) => state.settings);
    const voip = useSelector((state) => state.voip);

    const dispatch = useDispatch();

    const setMasterVolume = (volume) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { masterVolume: volume },
        });
    };

    const setMusicVolume = (volume) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { musicVolume: volume },
        });
    };

    const setDialogueVolume = (volume) => {
        dispatch({
            type: ActionTypes.SET_CURRENT_SETTINGS,
            settings: { dialogueVolume: volume },
        });
    };

    const setVoipVolumeMultiplier = (volume) => {
        dispatch({
            type: ActionTypes.SET_VOIP_DATA,
            data: { volumeMultiplier: volume },
        });
    };

    const onVoipDeviceChange = (device) => {
        WebUI.Call('VoipSelectDevice', device.value);
    };

    const onVoipCutoffVolumeChange = (volume) => {
        WebUI.Call('VoipCutoffVolume', volume);
    };

    const onVoipVolumeMultiplierChange = (volume) => {
        WebUI.Call('VoipVolumeMultiplier', volume);
        setVoipVolumeMultiplier(volume);
    };

    const voipDevices = [];
    let selectedDevice = 0;

    for (let i = 0; i < voip.devices.length; ++i) {
        let device = voip.devices[i];
        voipDevices.push({ value: device.id, label: device.name });

        if (device.id === voip.selectedDevice) {
            selectedDevice = i;
        }
    }

    if (voipDevices.length === 0) {
        voipDevices.push({ value: -1, label: 'No microphone detected' });
        selectedDevice = 0; // I don't think we need this one
    }

    return (
        <>
            <h2>Audio settings</h2>
            <div className="settings-row">
                <h3>Master volume</h3>
                <Slider onChange={setMasterVolume} value={settings.currentSettings.masterVolume} />
            </div>
            <div className="settings-row">
                <h3>Music volume</h3>
                <Slider onChange={setMusicVolume} value={settings.currentSettings.musicVolume} />
            </div>
            <div className="settings-row">
                <h3>Dialogue volume</h3>
                <Slider onChange={setDialogueVolume} value={settings.currentSettings.dialogueVolume} />
            </div>
            <h2>VoIP settings</h2>
            <div className="settings-row">
                <h3>Microphone Device</h3>
                <Select
                    options={voipDevices}
                    isSearchable={false}
                    value={voipDevices[selectedDevice]}
                    onChange={onVoipDeviceChange}
                    styles={SELECT_STYLE}
                />
            </div>
            <div className="settings-row">
                <h3>Voice activation threshold</h3>
                <VoipSlider onChange={onVoipCutoffVolumeChange} volume={voip.volume} value={voip.cutoffVolume} />
            </div>
            <div className="settings-row">
                <h3>Volume</h3>
                <NumberInput
                    value={voip.volumeMultiplier}
                    onChange={onVoipVolumeMultiplierChange}
                    min={0.0}
                    max={5.0}
                />
            </div>
        </>
    );
}
