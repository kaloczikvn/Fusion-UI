import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export default function SliderInput({ className, value, onChange, min = 0, max = 100 }) {
    const sliderClassName = useMemo(() => {
        return className ? `slider-input ${className}` : 'slider-input';
    }, [className]);
    
    // Convert external value to internal value (handle both 0-1 and actual value ranges)
    const [localValue, setLocalValue] = useState(() => {
        // If value is within min-max range, use it directly
        if (value >= min && value <= max) {
            return Math.round(value);
        }
        // Otherwise treat as normalized 0-1 value
        return Math.round(value * (max - min) + min);
    });
    const sliderRef = useRef(null);
    const isDragging = useRef(false);
    const rectCache = useRef(null);
    
    // Memoize styles to prevent recreation on every render
    const styles = useMemo(() => ({
        slider: {
            flex: '1',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            position: 'relative',
            cursor: 'pointer',
            margin: '10px 0'
        },
        thumb: {
            position: 'absolute',
            top: '0',
            width: '16px',
            height: '16px',
            background: '#ffffff',
            borderRadius: '50%',
            transform: 'translateX(-50%) translateY(-6px)',
            cursor: 'pointer',
            opacity: '0.8'
        },
        track: {
            height: '4px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '2px',
            position: 'absolute',
            top: '0',
            left: '0'
        }
    }), []);
    
    // Update local value when external value changes
    useEffect(() => {
        let newValue;
        // If value is within min-max range, use it directly
        if (value >= min && value <= max) {
            newValue = Math.round(value);
        } else {
            // Otherwise treat as normalized 0-1 value
            newValue = Math.round(value * (max - min) + min);
        }
        
        if (!isDragging.current) {
            setLocalValue(newValue);
        }
    }, [value, min, max]);
    
    // Cache rect to avoid repeated getBoundingClientRect calls
    const updateRectCache = useCallback(() => {
        if (sliderRef.current) {
            rectCache.current = sliderRef.current.getBoundingClientRect();
        }
    }, []);
    
    const updateSliderValue = useCallback((e) => {
        if (!rectCache.current) return;
        
        const x = e.clientX - rectCache.current.left;
        let percentage = Math.max(0, Math.min(100, (x / rectCache.current.width) * 100));
        
        // Round percentage to avoid floating point precision issues
        percentage = Math.round(percentage * 100) / 100;
        
        // Convert percentage to min-max range
        const rawValue = (percentage / 100) * (max - min) + min;
        const newValue = Math.round(rawValue);
        const clampedValue = Math.max(min, Math.min(max, newValue));
        
        setLocalValue(clampedValue);
        
        // Always return the actual value (not normalized) for onChange
        onChange(clampedValue);
    }, [onChange, min, max]);
    
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        
        // Cache rect once at start of drag
        updateRectCache();
        updateSliderValue(e);
        
        const handleMouseMove = (moveEvent) => {
            if (isDragging.current) {
                updateSliderValue(moveEvent);
            }
        };
        
        const handleMouseUp = () => {
            isDragging.current = false;
            rectCache.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [updateSliderValue, updateRectCache]);
    
    const handleSliderClick = useCallback((e) => {
        if (!isDragging.current) {
            updateRectCache();
            updateSliderValue(e);
        }
    }, [updateSliderValue, updateRectCache]);
    
    const onInputChange = useCallback((e) => {
        let inputValue = e.target.value;
        
        if (inputValue === '') {
            setLocalValue(min);
            onChange(min); // Return actual min value
            return;
        }
        
        // Allow negative numbers if min is negative
        const allowNegative = min < 0;
        const regex = allowNegative ? /[^0-9-]/g : /[^0-9]/g;
        inputValue = inputValue.replace(regex, '');
        
        if (inputValue === '' || inputValue === '-') {
            inputValue = min.toString();
        }
        
        let numValue = parseInt(inputValue, 10) || min;
        
        // Clamp to min-max range
        if (numValue > max) {
            numValue = max;
            e.target.value = max.toString();
        } else if (numValue < min) {
            numValue = min;
            e.target.value = min.toString();
        }
        
        setLocalValue(numValue);
        
        // Return the actual value (not normalized) for onChange
        onChange(numValue);
    }, [onChange, min, max]);
    
    // Calculate percentage for visual positioning (0-100%)
    const percentage = useMemo(() => {
        return ((localValue - min) / (max - min)) * 100;
    }, [localValue, min, max]);
    
    // Memoize dynamic styles
    const thumbStyleWithPosition = useMemo(() => ({
        ...styles.thumb,
        left: `${percentage}%`
    }), [styles.thumb, percentage]);
    
    const trackStyleWithWidth = useMemo(() => ({
        ...styles.track,
        width: `${percentage}%`
    }), [styles.track, percentage]);
    
    return (
        <div className={sliderClassName}>
            <input
                className="slider-value"
                type="text"
                maxLength={max.toString().length + (min < 0 ? 1 : 0)} // Account for negative sign
                onChange={onInputChange}
                value={localValue}
            />
            <div
                ref={sliderRef}
                style={styles.slider}
                onMouseDown={handleMouseDown}
                onClick={handleSliderClick}
            >
                <div style={trackStyleWithWidth}></div>
                <div style={thumbStyleWithPosition}></div>
            </div>
        </div>
    );
}