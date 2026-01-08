'use client';

import React, { useState } from 'react';
import styles from './RunMode.module.css';
import { WorkshopInstance, Activity } from '@/lib/types';
import Timer from './Timer';
import {
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    LifeBuoy,
    CheckCircle2,
    Sparkles,
    Edit3,
    Check,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunModeProps {
    instance: WorkshopInstance;
    onComplete: (instance: WorkshopInstance) => void;
    onBackToTune: () => void;
}

const RESCUE_MOVES = [
    {
        id: 'low_participation',
        label: 'Low Participation',
        situation: 'Room is quiet, only a few people speaking up',
        move: 'Switch to silent writing for 3 minutes, then have each person share one idea. This gives introverts time to formulate thoughts.',
    },
    {
        id: 'stuck_deciding',
        label: 'Stuck on a Decision',
        situation: 'Group is going in circles, can\'t reach consensus',
        move: 'Use dot voting: give everyone 3 dots to vote on options. If still tied, the decision-maker makes the final call.',
    },
    {
        id: 'dominant_voice',
        label: 'Dominant Voice',
        situation: 'One or two people are dominating the conversation',
        move: 'Call for a round-robin: "Let\'s hear from everyone. We\'ll go around the room, one minute each." Start with the quietest person.',
    },
    {
        id: 'running_late',
        label: 'Running Behind',
        situation: 'Activity is taking longer than planned',
        move: 'Timeboxing: announce "5 more minutes on this topic, then we move on." Cut scope not quality—defer items to a parking lot.',
    },
];

const RunMode: React.FC<RunModeProps> = ({ instance, onComplete, onBackToTune }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [editingScript, setEditingScript] = useState(false);
    const [customScripts, setCustomScripts] = useState<Record<string, string>>({});
    const currentActivity = instance.agenda[currentIndex];

    // Get the script - custom if edited, otherwise original
    const currentScript = customScripts[currentActivity.id] ?? currentActivity.facilitatorScript;

    const handleScriptSave = (newScript: string) => {
        setCustomScripts(prev => ({
            ...prev,
            [currentActivity.id]: newScript
        }));
        setEditingScript(false);
    };

    const handleJumpToActivity = (idx: number) => {
        setCurrentIndex(idx);
        setEditingScript(false);
    };

    const handleNext = () => {
        if (currentIndex < instance.agenda.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(instance);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className={styles.container}>
            <header className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button className="button-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={onBackToTune}>
                    <ChevronLeft size={16} /> Back to Blueprint
                </button>
                <div className="flex">
                    <span className={styles.badge}>{instance.projectName}</span>
                    <span className={styles.badge} style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>{instance.type}</span>
                </div>
            </header>

            <div className={styles.layout}>
                <main className={`${styles.mainPanel} glass`} style={{ background: 'white' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentActivity.id}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -10 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        >
                            <div className={styles.activityHeader}>
                                <div>
                                    <div className={styles.stepType}>Phase {currentIndex + 1} of {instance.agenda.length} • {currentActivity.type}</div>
                                    <h2 className={styles.stepTitle}>{currentActivity.name}</h2>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem' }}>{currentActivity.description}</p>
                                </div>
                            </div>

                            <div className={styles.instructions}>
                                <div className={styles.instructionLabel}>What to do</div>
                                {currentActivity.instructions}
                            </div>

                            <div className={styles.script}>
                                <div className={styles.scriptHeader}>
                                    <div className={styles.scriptLabel}>
                                        <MessageCircle size={12} style={{ marginRight: '4px' }} />
                                        Facilitator script
                                        {customScripts[currentActivity.id] && (
                                            <span className={styles.editedBadge}>Edited</span>
                                        )}
                                    </div>
                                    {!editingScript && (
                                        <button
                                            className={styles.editButton}
                                            onClick={() => setEditingScript(true)}
                                            title="Edit script"
                                        >
                                            <Edit3 size={14} />
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingScript ? (
                                    <div className={styles.scriptEditContainer}>
                                        <textarea
                                            className={styles.scriptTextarea}
                                            defaultValue={currentScript}
                                            id="script-editor"
                                            rows={4}
                                        />
                                        <div className={styles.scriptEditActions}>
                                            <button
                                                className="button-secondary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                onClick={() => setEditingScript(false)}
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                className="button-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                onClick={() => {
                                                    const editor = document.getElementById('script-editor') as HTMLTextAreaElement;
                                                    if (editor) handleScriptSave(editor.value);
                                                }}
                                            >
                                                <Check size={14} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.scriptContent}>
                                        "{currentScript}"
                                    </div>
                                )}
                            </div>

                            <div className={styles.artifactCapture}>
                                <div className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Artifacts you'll generate 🎁</div>
                                <div className={styles.artifactList}>
                                    {currentActivity.requiredArtifacts.map(artifact => (
                                        <span key={artifact} className={styles.artifactTag}>
                                            <CheckCircle2 size={14} style={{ color: 'hsl(var(--success))', marginRight: '6px' }} />
                                            {artifact}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className={styles.rescueBox}>
                        <div className={styles.rescueTitle}>
                            <LifeBuoy size={16} />
                            Rescue Moves
                        </div>
                        <div className={styles.rescueList}>
                            {RESCUE_MOVES.map(move => (
                                <div key={move.id} className={styles.rescueCard}>
                                    <div className={styles.rescueLabel}>{move.label}</div>
                                    <div className={styles.rescueSituation}>{move.situation}</div>
                                    <div className={styles.rescueMove}>{move.move}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.controls}>
                        <button className="button-secondary" onClick={handlePrev} disabled={currentIndex === 0}>
                            <ChevronLeft size={20} /> Back
                        </button>
                        <button className="button-primary" onClick={handleNext}>
                            {currentIndex === instance.agenda.length - 1 ? 'Finish & Celebrate! 🎊' : 'Next Step'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </main>

                <aside className={styles.sidebar}>
                    <Timer initialMinutes={currentActivity.duration} />

                    <div className={`${styles.sidebarCard} glass`} style={{ background: 'white' }}>
                        <div className={styles.label} style={{ fontSize: '0.85rem', textAlign: 'left', marginBottom: '1.5rem' }}>Session Roadmap</div>
                        <div className={styles.agendaList}>
                            {instance.agenda.map((activity, idx) => (
                                <button
                                    key={`${activity.id}-${idx}`}
                                    className={`${styles.agendaItem} ${styles.agendaItemClickable} ${idx === currentIndex ? styles.agendaItemActive : ''} ${idx < currentIndex ? styles.agendaItemDone : ''}`}
                                    onClick={() => handleJumpToActivity(idx)}
                                >
                                    <div className={styles.agendaItemInfo}>
                                        <div className={styles.circle}>{idx < currentIndex ? '✓' : idx + 1}</div>
                                        <span>{activity.name}</span>
                                    </div>
                                    <span className={styles.agendaTime}>{activity.duration}m</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default RunMode;
