import type { KeyboardEvent } from 'react';

export function onEnterKeyDown(e: KeyboardEvent, callback: (e: KeyboardEvent) => void) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        if (callback) callback(e);
    }
}
