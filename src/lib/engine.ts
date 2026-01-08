import { Activity, LeverId, WorkshopRecipe, Lever } from './types';

// =============================================
// CONSTANTS & CONFIGURATION
// =============================================

const MIN_ACTIVITY_DURATION = 5; // Minimum meaningful activity duration

// Activities that can be added by levers (not in base recipe)
const BONUS_ACTIVITY_IDS = [
    'icebreaker',       // playfulness=100
    'celebration',      // playfulness=100
    'energizer',        // energy=100
    'speed_round',      // energy=100
    'reflection',       // energy=0
    'devils_advocate',  // conflict=100
    'risk_mapping',     // conflict=100
    'silent_brainstorm' // participation=100
];

// Time-based configuration for activity count
const getTimeConfig = (targetDuration: number) => {
    if (targetDuration <= 30) return { maxActivities: 4, includeBonus: false };
    if (targetDuration <= 45) return { maxActivities: 5, includeBonus: false };
    if (targetDuration <= 60) return { maxActivities: 6, includeBonus: true };
    if (targetDuration <= 90) return { maxActivities: 8, includeBonus: true };
    return { maxActivities: 10, includeBonus: true };
};

// Activity priority for removal (higher = remove first)
const REMOVAL_PRIORITY: Record<string, number> = {
    // Bonus activities - remove first
    'icebreaker': 10,
    'celebration': 10,
    'energizer': 9,
    'speed_round': 9,
    'reflection': 9,
    'devils_advocate': 8,
    'risk_mapping': 8,
    'silent_brainstorm': 8,
    // Convergence - remove second
    'voting': 5,
    // Core - remove last
    'intro': 1,
    'wrap_up': 2,
    'problem_map': 1,
    'crazy_8s': 1,
    'retro': 1,
    'roles': 1,
};

// =============================================
// BONUS ACTIVITY DEFINITIONS
// =============================================

const BONUS_ACTIVITIES: Record<string, Activity> = {
    icebreaker: {
        id: 'icebreaker',
        name: 'Warm-Up Game',
        duration: 5,
        description: 'Fun activity to get everyone loose and creative.',
        instructions: 'Two truths and a lie - each person shares, group guesses the lie!',
        facilitatorScript: "Let's start with some fun! Two truths and a lie - who wants to go first?",
        requiredArtifacts: [],
        type: 'setup',
    },
    celebration: {
        id: 'celebration',
        name: 'Wins & High-Fives',
        duration: 5,
        description: 'Celebrate what we accomplished together.',
        instructions: 'Go around and share one thing you appreciated about this session.',
        facilitatorScript: "Before we go - let's celebrate! What was a win for you today?",
        requiredArtifacts: [],
        type: 'close',
    },
    energizer: {
        id: 'energizer',
        name: 'Quick Energizer',
        duration: 5,
        description: 'Physical movement to boost energy.',
        instructions: 'Stand up! 30 seconds of stretching, then a quick "would you rather" question.',
        facilitatorScript: "Everyone up! Quick stretch - reach for the ceiling. Now shake it out!",
        requiredArtifacts: [],
        type: 'setup',
    },
    speed_round: {
        id: 'speed_round',
        name: 'Lightning Decisions',
        duration: 5,
        description: 'Rapid-fire decision making.',
        instructions: '30 seconds per decision. Go with your gut. No overthinking!',
        facilitatorScript: "Speed round! 30 seconds each. What's your gut say?",
        requiredArtifacts: ['Quick Wins'],
        type: 'converge',
    },
    reflection: {
        id: 'reflection',
        name: 'Quiet Reflection',
        duration: 5,
        description: 'Individual processing time.',
        instructions: 'Take 5 minutes to write down your personal takeaways. No discussion.',
        facilitatorScript: "Let's take a moment to reflect individually. What resonated with you today?",
        requiredArtifacts: ['Personal Notes'],
        type: 'close',
    },
    devils_advocate: {
        id: 'devils_advocate',
        name: "Devil's Advocate Round",
        duration: 8,
        description: 'Challenge assumptions and surface disagreements.',
        instructions: 'Each person must argue AGAINST the most popular idea. Find the flaws.',
        facilitatorScript: "Now let's stress-test our thinking. I want you to argue against the top ideas.",
        requiredArtifacts: ['Concerns List'],
        type: 'converge',
    },
    risk_mapping: {
        id: 'risk_mapping',
        name: 'Risk & Mitigation Map',
        duration: 8,
        description: 'Identify what could go wrong and how to prevent it.',
        instructions: 'List top 3 risks and one mitigation strategy for each.',
        facilitatorScript: "Before we wrap up, let's be realistic about what could derail us.",
        requiredArtifacts: ['Risk Matrix'],
        type: 'converge',
    },
    silent_brainstorm: {
        id: 'silent_brainstorm',
        name: 'Silent Brainstorm',
        duration: 8,
        description: 'Individual thinking time before group discussion.',
        instructions: 'Everyone writes ideas silently for 5 minutes. No talking. Then we share.',
        facilitatorScript: "Let's start with 5 minutes of silent writing. Get your thoughts down on paper.",
        requiredArtifacts: ['Individual Ideas'],
        type: 'diverge',
    },
};

// =============================================
// MAIN ENGINE FUNCTION
// =============================================

export const applyLeversToAgenda = (
    baseAgenda: Activity[],
    levers: Record<LeverId, number>,
    targetDuration: number = 60
): Activity[] => {
    let agenda = [...baseAgenda];
    const config = getTimeConfig(targetDuration);

    // =============================================
    // STEP 1: Apply lever MODIFICATIONS (not additions)
    // =============================================

    // Participation modifications
    if (levers.participation === 100) {
        agenda = agenda.map(a => {
            if (a.type === 'diverge') {
                return {
                    ...a,
                    name: a.name + ' (Round Robin)',
                    instructions: 'Go around the room. Each person gets 2 minutes to share. No interruptions. ' + a.instructions,
                };
            }
            return a;
        });
    } else if (levers.participation === 0) {
        agenda = agenda.map(a => ({
            ...a,
            instructions: 'Open discussion format - jump in anytime. ' + a.instructions,
        }));
    }

    // Conflict modifications
    if (levers.conflict === 0) {
        agenda = agenda.map(a => ({
            ...a,
            instructions: 'Focus on building consensus. ' + a.instructions,
        }));
    }

    // Playfulness name changes
    if (levers.playfulness === 100) {
        const funNames: Record<string, string> = {
            'wrap_up': 'The Grand Finale',
            'voting': 'Dot Voting Party',
            'problem_map': 'Detective Mode',
            'crazy_8s': 'Sketch Frenzy',
            'retro': 'Time Machine Review',
            'roles': 'Superhero Assignments',
        };
        agenda = agenda.map(a => ({
            ...a,
            name: funNames[a.id] || a.name,
        }));
    } else if (levers.playfulness === 0) {
        const formalNames: Record<string, string> = {
            'intro': 'Session Objectives',
            'wrap_up': 'Action Items & Close',
            'voting': 'Priority Assessment',
            'problem_map': 'Issue Analysis',
            'crazy_8s': 'Concept Development',
            'retro': 'Performance Review',
            'roles': 'Responsibility Matrix',
        };
        agenda = agenda.map(a => ({
            ...a,
            name: formalNames[a.id] || a.name,
            instructions: a.instructions.replace(/fun|creative|play|game/gi, 'productive'),
        }));
    }

    // =============================================
    // STEP 2: Add bonus activities ONLY if time allows
    // =============================================

    if (config.includeBonus) {
        // Playfulness bonuses
        if (levers.playfulness === 100) {
            if (!agenda.some(a => a.id === 'icebreaker')) {
                const activity = { ...BONUS_ACTIVITIES.icebreaker };
                agenda.unshift(activity);
            }
            if (!agenda.some(a => a.id === 'celebration')) {
                const activity = { ...BONUS_ACTIVITIES.celebration };
                agenda.splice(agenda.length - 1, 0, activity);
            }
        }

        // Energy bonuses
        if (levers.energy === 100) {
            if (!agenda.some(a => a.id === 'energizer')) {
                const midpoint = Math.floor(agenda.length / 2);
                const activity = { ...BONUS_ACTIVITIES.energizer };
                agenda.splice(midpoint, 0, activity);
            }
            if (!agenda.some(a => a.id === 'speed_round')) {
                const activity = { ...BONUS_ACTIVITIES.speed_round };
                agenda.splice(agenda.length - 1, 0, activity);
            }
        } else if (levers.energy === 0) {
            if (!agenda.some(a => a.id === 'reflection')) {
                const activity = { ...BONUS_ACTIVITIES.reflection };
                agenda.splice(agenda.length - 1, 0, activity);
            }
        }

        // Conflict bonuses
        if (levers.conflict === 100) {
            if (!agenda.some(a => a.id === 'devils_advocate')) {
                const mainActivityIndex = agenda.findIndex(a => a.type === 'diverge');
                const activity = { ...BONUS_ACTIVITIES.devils_advocate };
                agenda.splice(mainActivityIndex + 1, 0, activity);
            }
            if (!agenda.some(a => a.id === 'risk_mapping')) {
                const activity = { ...BONUS_ACTIVITIES.risk_mapping };
                agenda.splice(agenda.length - 1, 0, activity);
            }
        }

        // Participation bonuses
        if (levers.participation === 100) {
            if (!agenda.some(a => a.id === 'silent_brainstorm')) {
                const activity = { ...BONUS_ACTIVITIES.silent_brainstorm };
                agenda.splice(1, 0, activity);
            }
        }
    }

    // =============================================
    // STEP 3: Prune activities if too many
    // =============================================

    while (agenda.length > config.maxActivities) {
        // Find highest priority (most removable) activity
        let highestPriorityIdx = -1;
        let highestPriority = -1;

        agenda.forEach((a, idx) => {
            const priority = REMOVAL_PRIORITY[a.id] ?? 5;
            if (priority > highestPriority) {
                highestPriority = priority;
                highestPriorityIdx = idx;
            }
        });

        if (highestPriorityIdx >= 0) {
            agenda.splice(highestPriorityIdx, 1);
        } else {
            break; // Safety valve
        }
    }

    // =============================================
    // STEP 4: Scale durations to fit target time
    // =============================================

    const currentTotal = agenda.reduce((sum, a) => sum + a.duration, 0);
    if (currentTotal > 0) {
        const scaleFactor = targetDuration / currentTotal;

        agenda = agenda.map(a => ({
            ...a,
            duration: Math.max(MIN_ACTIVITY_DURATION, Math.round(a.duration * scaleFactor))
        }));

        // Adjust to hit exact target
        const scaledTotal = agenda.reduce((sum, a) => sum + a.duration, 0);
        const diff = targetDuration - scaledTotal;

        if (diff !== 0 && agenda.length > 0) {
            // Find the main activity (largest one) to absorb the difference
            const mainIdx = agenda.reduce((maxIdx, a, idx, arr) =>
                a.duration > arr[maxIdx].duration ? idx : maxIdx, 0);
            agenda[mainIdx] = {
                ...agenda[mainIdx],
                duration: Math.max(MIN_ACTIVITY_DURATION, agenda[mainIdx].duration + diff)
            };
        }
    }

    return agenda;
};

// =============================================
// HELPER: Check if activity is removable
// =============================================

export const isActivityRemovable = (activityId: string): boolean => {
    // Bonus activities are always removable
    if (BONUS_ACTIVITY_IDS.includes(activityId)) return true;
    // Voting is removable
    if (activityId === 'voting') return true;
    // Core activities are not easily removable
    return false;
};

// =============================================
// HELPER: Check if activity is a bonus activity
// =============================================

export const isBonusActivity = (activityId: string): boolean => {
    return BONUS_ACTIVITY_IDS.includes(activityId);
};
