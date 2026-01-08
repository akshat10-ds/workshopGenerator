'use client';

import React, { useMemo, useState } from 'react';
import styles from './TuningView.module.css';
import { Lever, LeverId, WorkshopRecipe, Activity } from '@/lib/types';
import Levers from './Levers';
import { applyLeversToAgenda, isBonusActivity } from '@/lib/engine';
import { Settings2, Eye, ArrowRight, RefreshCw, ArrowLeft, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TuningViewProps {
    recipe: WorkshopRecipe;
    levers: Lever[];
    initialDuration?: number;
    onLeverChange: (id: LeverId, levelIndex: number) => void;
    onConfirm: (finalAgenda: Activity[]) => void;
    onBack?: () => void;
}

const TIME_PRESETS = [30, 45, 60, 90, 120];

const MIN_ACTIVITY_DURATION = 5;

const TuningView: React.FC<TuningViewProps> = ({ recipe, levers, initialDuration = 60, onLeverChange, onConfirm, onBack }) => {
    const [swappedActivities, setSwappedActivities] = useState<Record<string, Partial<Activity>>>({});
    const [targetDuration, setTargetDuration] = useState<number>(initialDuration);
    const [removedActivityIds, setRemovedActivityIds] = useState<Set<string>>(new Set());

    const currentLeversValues = useMemo(() => {
        return levers.reduce((acc, lever) => ({
            ...acc,
            [lever.id]: lever.levels[lever.currentLevelIndex].value
        }), {} as Record<LeverId, number>);
    }, [levers]);

    const agenda = useMemo(() => {
        // Pass targetDuration to engine for smart activity selection
        const baseApplied = applyLeversToAgenda(recipe.baseAgenda, currentLeversValues, targetDuration);

        // Filter out manually removed activities
        const withoutRemoved = baseApplied.filter(a => !removedActivityIds.has(a.id));

        // Apply swaps
        const withSwaps = withoutRemoved.map(a => swappedActivities[a.id] ? { ...a, ...swappedActivities[a.id] } : a);

        // Scale durations to fit target duration exactly
        const currentTotal = withSwaps.reduce((sum, a) => sum + a.duration, 0);
        if (currentTotal === 0) return withSwaps;

        const scaleFactor = targetDuration / currentTotal;
        const scaled = withSwaps.map(a => ({
            ...a,
            duration: Math.max(MIN_ACTIVITY_DURATION, Math.round(a.duration * scaleFactor))
        }));

        // Adjust main activity to ensure exact match with target duration
        const scaledTotal = scaled.reduce((sum, a) => sum + a.duration, 0);
        const diff = targetDuration - scaledTotal;
        if (diff !== 0 && scaled.length > 0) {
            // Find the main activity (largest one) to absorb the difference
            const mainIdx = scaled.reduce((maxIdx, a, idx, arr) =>
                a.duration > arr[maxIdx].duration ? idx : maxIdx, 0);
            scaled[mainIdx] = {
                ...scaled[mainIdx],
                duration: Math.max(MIN_ACTIVITY_DURATION, scaled[mainIdx].duration + diff)
            };
        }

        return scaled;
    }, [recipe.baseAgenda, currentLeversValues, swappedActivities, targetDuration, removedActivityIds]);

    const handleSwap = (activity: Activity) => {
        if (!activity.swapOptions || activity.swapOptions.length === 0) return;

        if (swappedActivities[activity.id]) {
            const newSwaps = { ...swappedActivities };
            delete newSwaps[activity.id];
            setSwappedActivities(newSwaps);
        } else {
            const option = activity.swapOptions[0];
            setSwappedActivities({
                ...swappedActivities,
                [activity.id]: {
                    name: option.name,
                    description: option.description,
                    instructions: option.instructions,
                    facilitatorScript: option.script
                }
            });
        }
    };

    const handleRemoveActivity = (activityId: string) => {
        setRemovedActivityIds(prev => new Set([...prev, activityId]));
    };

    // Reset removed activities when duration changes significantly
    const handleDurationChange = (mins: number) => {
        // If switching between short (<60) and long (>=60), reset removals
        const wasShort = targetDuration < 60;
        const isShort = mins < 60;
        if (wasShort !== isShort) {
            setRemovedActivityIds(new Set());
        }
        setTargetDuration(mins);
    };

    const totalDuration = agenda.reduce((sum, a) => sum + a.duration, 0);

    return (
        <div className={`${styles.container} animate-in`}>
            {/* Simplified header */}
            <header className={styles.topHeader}>
                <div className={styles.headerLeft}>
                    {onBack && (
                        <button className={styles.backButton} onClick={onBack}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className={styles.headerInfo}>
                        <h1 className={styles.pageTitle}>Fine-tune Your Session</h1>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.timeSelector}>
                        {TIME_PRESETS.map(mins => (
                            <button
                                key={mins}
                                className={`${styles.timePresetButton} ${targetDuration === mins ? styles.timePresetActive : ''}`}
                                onClick={() => handleDurationChange(mins)}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                    <button className="button-primary" onClick={() => onConfirm(agenda)}>
                        Start Session
                        <ArrowRight size={18} />
                    </button>
                </div>
            </header>

            <div className={styles.mainContent}>
                <aside className={`${styles.sidebar} glass`}>
                    <h2 className={styles.sectionTitle}>
                        <Settings2 size={20} color="hsl(var(--primary))" />
                        Customize Your Flow
                    </h2>
                    <Levers levers={levers} onChange={onLeverChange} />

                    {targetDuration < 60 && (
                        <div className={styles.timeNote}>
                            <Sparkles size={14} />
                            <span>Bonus activities unlock at 60+ minutes</span>
                        </div>
                    )}
                </aside>

                <main className={`${styles.preview} glass`}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                            <Eye size={20} color="hsl(var(--primary))" />
                            Workshop Blueprint
                        </h2>
                        <div className={styles.tag}>
                            {agenda.length} activities • {totalDuration}m
                        </div>
                    </header>

                    <div className={styles.agenda}>
                        <AnimatePresence mode="popLayout">
                            {agenda.map((activity, index) => {
                                const isBase = recipe.baseAgenda.some(a => a.id === activity.id);
                                const isSwapped = !!swappedActivities[activity.id];
                                const hasOptions = !!activity.swapOptions && activity.swapOptions.length > 0;
                                const isBonus = isBonusActivity(activity.id);
                                const canRemove = agenda.length > 3; // Keep at least 3 activities

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                        key={`${activity.id}-${index}`}
                                        className={`${styles.activityCard} glass ${isBonus ? styles.bonusActivity : ''} ${isSwapped ? styles.modifiedIndicator : ''}`}
                                    >
                                        <div className={styles.activityInfo}>
                                            <div className={styles.activityType}>
                                                {activity.type}
                                                {isBonus && <span className={styles.bonusBadge}>Optional</span>}
                                                {isSwapped && <span className={styles.swappedBadge}>Swapped</span>}
                                            </div>
                                            <div className={styles.activityName}>{activity.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {activity.description}
                                            </div>
                                        </div>

                                        <div className={styles.activityActions}>
                                            {hasOptions && (
                                                <button
                                                    className={styles.swapButton}
                                                    onClick={() => handleSwap(activity)}
                                                    title="Swap with alternative format"
                                                >
                                                    <RefreshCw size={14} />
                                                    {isSwapped ? 'Original' : 'Swap'}
                                                </button>
                                            )}
                                            {canRemove && (
                                                <button
                                                    className={styles.removeButton}
                                                    onClick={() => handleRemoveActivity(activity.id)}
                                                    title="Remove activity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            <div className={styles.activityDuration}>
                                                {activity.duration}m
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {removedActivityIds.size > 0 && (
                        <button
                            className={styles.resetButton}
                            onClick={() => setRemovedActivityIds(new Set())}
                        >
                            <RefreshCw size={14} />
                            Reset removed activities
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TuningView;
