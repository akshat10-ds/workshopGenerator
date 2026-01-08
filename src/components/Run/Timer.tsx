'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import styles from './RunMode.module.css';

interface TimerProps {
    initialMinutes: number;
    onComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete }) => {
    const [seconds, setSeconds] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setSeconds(initialMinutes * 60);
        setIsActive(false);
    }, [initialMinutes]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            onComplete?.();
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, onComplete]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setSeconds(initialMinutes * 60);
        setIsActive(false);
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`${styles.timerCard} glass`}>
            <div className={styles.timer}>{formatTime(seconds)}</div>
            <div className="flex" style={{ justifyContent: 'center' }}>
                <button className="button-secondary" style={{ padding: '0.75rem' }} onClick={toggle}>
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className="button-secondary" style={{ padding: '0.75rem' }} onClick={reset}>
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
};

export default Timer;
