import React from 'react';
import Slider from 'rc-slider';

export default function VoipSlider({ value, volume, onChange }) {
    let volumeClassName = 'voip-volume';

    if (volume >= value) volumeClassName += ' active';

    const onSliderChange = (sliderValue) => {
        onChange(sliderValue / 100.0);
    };

    const onInputChange = (e) => {
        // Make sure to only allow numbers.
        if (e.target.value.length > 0 && !e.target.value.match(/[0-9]+/g)) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            return;
        }

        if (e.target.value.length === 0) e.target.value = '0';

        let inputValue = parseInt(e.target.value, 10);

        if (inputValue > 100) {
            e.target.value = '100';
            inputValue = 100;
        }

        onChange(inputValue / 100.0);
    };

    return (
        <div className="slider-input voip-slider">
            <input
                className="slider-value"
                type="text"
                maxLength={3}
                onChange={onInputChange}
                value={Math.round(value * 100)}
            />
            <Slider onChange={onSliderChange} value={value * 100}>
                <div className={volumeClassName} style={{ width: volume * 100.0 + '%' }} />
            </Slider>
        </div>
    );
}
