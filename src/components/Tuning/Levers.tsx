'use client';

import React from 'react';
import styles from './Levers.module.css';
import { Lever, LeverId } from '@/lib/types';
import { Sparkles, ShieldAlert, Users, MessageSquare, Zap, Settings2 } from 'lucide-react';

interface LeversProps {
    levers: Lever[];
    onChange: (id: LeverId, levelIndex: number) => void;
}

const LEVER_ICONS: Record<LeverId, React.ReactNode> = {
    clarity: <Sparkles size={18} />,
    decision: <ShieldAlert size={18} />,
    participation: <Users size={18} />,
    conflict: <MessageSquare size={18} />,
    energy: <Zap size={18} />,
    playfulness: <Settings2 size={18} />,
};

const Levers: React.FC<LeversProps> = ({ levers, onChange }) => {
    return (
        <div className={styles.container}>
            {levers.map((lever) => (
                <div key={lever.id} className={styles.leverRow}>
                    <div className={styles.header}>
                        <div className={styles.label}>
                            <span className={styles.icon}>{LEVER_ICONS[lever.id]}</span>
                            {lever.label}
                        </div>
                    </div>

                    <div className={styles.levelsGrid}>
                        {lever.levels.map((level, idx) => (
                            <button
                                key={`${lever.id}-${idx}`}
                                className={`${styles.levelButton} ${lever.currentLevelIndex === idx ? styles.activeLevel : ''}`}
                                onClick={() => onChange(lever.id, idx)}
                            >
                                <div className={styles.levelLabel}>{level.label}</div>
                            </button>
                        ))}
                    </div>

                    <div className={styles.description}>
                        {lever.levels[lever.currentLevelIndex].description}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Levers;
