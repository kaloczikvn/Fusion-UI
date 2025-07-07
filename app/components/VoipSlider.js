import React from 'react';
import Slider from './Slider';

export default function VoipSlider({ value, volume, onChange }) {
    let volumeClassName = 'voip-volume';

    if (volume >= value) volumeClassName += ' active';

    const onSliderChange = (sliderValue) => {
        onChange(sliderValue / 100.0);
    };

    return (
        <Slider onChange={onSliderChange} value={value} />    
    );
}
