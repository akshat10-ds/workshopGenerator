'use client';

import React, { useState } from 'react';
import styles from './Generator.module.css';
import { WorkshopType, WorkshopInstance, Activity, Lever, LeverId } from '@/lib/types';
import { RECIPES, DEFAULT_LEVERS } from '@/lib/recipes';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, ArrowRight, Settings2, PlayCircle, Trophy, CheckCircle, Copy, Layout, Zap, Clock } from 'lucide-react';

const SAMPLE_PROJECTS = [
    {
        name: 'Sprint Retrospective',
        goal: 'Reflect on last sprint, identify what worked and what didn\'t, and create actionable improvements',
        type: 'Retrospective' as WorkshopType,
    },
    {
        name: 'Navigator Pain Points',
        goal: 'Deeply understand navigator frustrations and prioritize which problems to solve first',
        type: 'Problem Framing' as WorkshopType,
    },
    {
        name: 'Feature Brainstorm',
        goal: 'Generate 50+ creative ideas for new features and narrow down to top 5 for prototyping',
        type: 'Ideation' as WorkshopType,
    },
    {
        name: 'Q2 Roadmap Alignment',
        goal: 'Align team on priorities and create shared understanding of goals for the quarter',
        type: 'Team Collaboration' as WorkshopType,
    },
];
import TuningView from '@/components/Tuning/TuningView';
import RunMode from '@/components/Run/RunMode';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'create' | 'tune' | 'run' | 'complete';

const TIME_OPTIONS = [30, 45, 60, 90, 120];

const Generator: React.FC = () => {
    const [step, setStep] = useState<Step>('create');
    const [projectName, setProjectName] = useState('');
    const [goal, setGoal] = useState('');
    const [selectedType, setSelectedType] = useState<WorkshopType | ''>('');
    const [targetDuration, setTargetDuration] = useState<number>(60);
    const [levers, setLevers] = useState<Lever[]>(DEFAULT_LEVERS);
    const [instance, setInstance] = useState<WorkshopInstance | null>(null);

    const handleCreate = () => {
        if (!projectName || !goal || !selectedType) return;
        setStep('tune');
    };

    const handleSelectSample = (sample: typeof SAMPLE_PROJECTS[0]) => {
        setProjectName(sample.name);
        setGoal(sample.goal);
        setSelectedType(sample.type);
    };

    const handleLeverChange = (id: LeverId, levelIndex: number) => {
        setLevers(prev => prev.map(l => l.id === id ? { ...l, currentLevelIndex: levelIndex } : l));
    };

    const handleConfirmTuning = (finalAgenda: Activity[]) => {
        const newInstance: WorkshopInstance = {
            id: uuidv4(),
            projectName,
            goal,
            type: selectedType as WorkshopType,
            duration: finalAgenda.reduce((sum, a) => sum + a.duration, 0),
            levers: levers.reduce((acc, l) => ({ ...acc, [l.id]: l.levels[l.currentLevelIndex].value }), {} as Record<LeverId, number>),
            agenda: finalAgenda,
            status: 'ready',
            currentStepIndex: 0,
            artifacts: {},
        };
        setInstance(newInstance);
        setStep('run');
    };

    const handleCompleteWorkshop = (finalInstance: WorkshopInstance) => {
        setInstance({ ...finalInstance, status: 'completed' });
        setStep('complete');
    };

    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`${styles.title} title-gradient`}
                >
                    Workshop Studio
                </motion.h1>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={styles.subtitle}
                >
                    Design and run effective workshops in minutes
                </motion.p>
            </header>

            <main className={styles.content} style={{ maxWidth: (step === 'tune' || step === 'run') ? '1200px' : '900px' }}>
                <AnimatePresence mode="wait">
                    {step === 'create' && (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className={styles.stepContainer}
                        >
                            {/* Sample Projects Quick Start */}
                            <div className={styles.sampleSection}>
                                <div className={styles.sampleHeader}>
                                    <Zap size={16} color="hsl(var(--primary))" />
                                    <span>Quick Start with a Sample</span>
                                </div>
                                <div className={styles.sampleGrid}>
                                    {SAMPLE_PROJECTS.map((sample, idx) => (
                                        <button
                                            key={idx}
                                            className={styles.sampleCard}
                                            onClick={() => handleSelectSample(sample)}
                                        >
                                            <span className={styles.sampleName}>{sample.name}</span>
                                            <span className={styles.sampleType}>{sample.type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className={styles.timeSection}>
                                <div className={styles.timeHeader}>
                                    <Clock size={16} color="hsl(var(--primary))" />
                                    <span>How much time do you have?</span>
                                </div>
                                <div className={styles.timeOptions}>
                                    {TIME_OPTIONS.map(mins => (
                                        <button
                                            key={mins}
                                            className={`${styles.timeOption} ${targetDuration === mins ? styles.timeOptionActive : ''}`}
                                            onClick={() => setTargetDuration(mins)}
                                        >
                                            <span className={styles.timeValue}>{mins}</span>
                                            <span className={styles.timeUnit}>mins</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formMain}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>The Project Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., Magic To-Do App"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>What's the Dream outcome?</label>
                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Tell us what success looks like..."
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.catalogSidebar}>
                                    <label className={styles.label}>Workshop Recipe Catalog</label>
                                    <div className={styles.catalogGrid}>
                                        {RECIPES.map((recipe, index) => (
                                            <motion.button
                                                key={recipe.type}
                                                data-type={recipe.type}
                                                className={`${styles.optionCard} ${selectedType === recipe.type ? styles.optionCardSelected : ''}`}
                                                onClick={() => setSelectedType(recipe.type)}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.08, duration: 0.4 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={styles.optionHeader}>
                                                    <Layout size={16} />
                                                    <h3>{recipe.type}</h3>
                                                </div>
                                                <p className={styles.optionDesc}>
                                                    {recipe.guaranteedOutcomes.join(', ')}
                                                </p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.progress}>
                                    <div className={`${styles.dot} ${styles.dotActive}`} />
                                    <div className={styles.dot} />
                                    <div className={styles.dot} />
                                </div>
                                <button
                                    className="button-primary"
                                    onClick={handleCreate}
                                    disabled={!projectName || !goal || !selectedType}
                                >
                                    Cook the Recipe 🍳
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'tune' && selectedType && (
                        <motion.div
                            key="tune"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <TuningView
                                recipe={RECIPES.find(r => r.type === selectedType)!}
                                levers={levers}
                                initialDuration={targetDuration}
                                onLeverChange={handleLeverChange}
                                onConfirm={handleConfirmTuning}
                                onBack={() => setStep('create')}
                            />
                        </motion.div>
                    )}

                    {step === 'run' && instance && (
                        <motion.div
                            key="run"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <RunMode
                                instance={instance}
                                onComplete={handleCompleteWorkshop}
                                onBackToTune={() => setStep('tune')}
                            />
                        </motion.div>
                    )}

                    {step === 'complete' && instance && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{ padding: '4rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}
                        >
                            <Trophy size={80} color="hsl(var(--accent))" style={{ marginBottom: '2rem' }} className="animate-in" />
                            <h2 className="title-gradient" style={{ fontSize: '3rem' }}>Workshop Slain! ⚔️</h2>
                            <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))', fontSize: '1.2rem' }}>
                                You're officially a facilitation rockstar. <strong>{projectName}</strong> is on its way to greatness.
                            </p>

                            <div style={{ marginTop: '3rem', textAlign: 'left' }} className="stack">
                                <div className={styles.label}>Your Treasure Chest of Artifacts 📦</div>
                                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'white' }}>
                                    {instance.agenda.map(a => a.requiredArtifacts).flat().map((art, idx) => (
                                        <div key={`${art}-${idx}`} className="flex" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            <CheckCircle size={20} color="hsl(var(--success))" />
                                            <span><strong>{art}</strong> — Generated Successfully</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '4rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                <button className="button-primary">
                                    <Copy size={20} />
                                    Copy Success Pack
                                </button>
                                <button className="button-secondary" style={{ padding: '1rem 2rem' }} onClick={() => setStep('create')}>
                                    Ready for Round 2?
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Generator;
