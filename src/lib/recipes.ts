import { WorkshopRecipe, Activity, Lever, WorkshopType } from './types';

export const WORKSHOP_TYPES: WorkshopType[] = [
    'Problem Framing',
    'Alignment & Decision',
    'Ideation',
    'Team Collaboration',
    'Critique',
    'Retrospective'
];

export const DEFAULT_LEVERS: Lever[] = [
    {
        id: 'participation',
        label: 'Participation',
        currentLevelIndex: 0,
        levels: [
            { label: 'Freeform', value: 0, description: 'Open flow, jump in any time.' },
            { label: 'Structured', value: 100, description: 'Silent writing and round-robin.' }
        ]
    },
    {
        id: 'conflict',
        label: 'Conflict Handling',
        currentLevelIndex: 0,
        levels: [
            { label: 'Low', value: 0, description: 'Assume group alignment.' },
            { label: 'High', value: 100, description: 'Surface tensions and tradeoffs.' }
        ]
    },
    {
        id: 'energy',
        label: 'Energy',
        currentLevelIndex: 1,
        levels: [
            { label: 'Calm', value: 0, description: 'Mellow, thoughtful pace.' },
            { label: 'Hyper', value: 100, description: 'Fast-paced, high energy.' }
        ]
    },
    {
        id: 'playfulness',
        label: 'Playfulness',
        currentLevelIndex: 0,
        levels: [
            { label: 'Corporate', value: 0, description: 'Professional and straight-faced.' },
            { label: 'Whimsical', value: 100, description: 'Fun, icons, and playful prompts.' }
        ]
    }
];

const COMMON_ACTIVITIES: Record<string, Activity> = {
    INTRO: {
        id: 'intro',
        name: 'Opener & Goals',
        duration: 5,
        description: 'Setting the stage and aligning on objectives.',
        instructions: `1. Welcome everyone and thank them for joining
2. Share the session goal: What we're here to accomplish today
3. Set expectations: timing, breaks, how to participate
4. Quick check-in: Ask everyone to share one word for how they're feeling`,
        facilitatorScript: `"Welcome everyone! Thanks for making time for this session.

Today we're here to [STATE GOAL]. By the end of this session, we'll have [CONCRETE OUTCOME].

Here's how we'll work: I'll guide us through each activity. Please keep yourself on mute when not speaking, and feel free to use the chat for questions.

Before we dive in - let's do a quick check-in. In one word, how are you feeling right now? I'll start: I'm feeling [YOUR WORD]."`,
        requiredArtifacts: ['Goal Statement'],
        type: 'setup',
        swapOptions: [
            {
                name: 'Quick Icebreaker',
                description: 'Start with a non-work question.',
                instructions: 'Ask: "What was your first concert?"',
                script: "Before we dive in, let's break the ice. What was your first concert?"
            }
        ]
    },
    VOTING: {
        id: 'voting',
        name: 'Dot Voting',
        duration: 10,
        description: 'Democratically prioritize ideas as a group.',
        instructions: `1. Give each person 3 votes (dots)
2. Everyone votes silently - no discussion during voting
3. You CAN put multiple dots on one item if you feel strongly
4. After voting, tally the results together
5. Discuss the top 3-5 items briefly`,
        facilitatorScript: `"Now let's prioritize. Everyone gets 3 votes.

Here are the rules:
- Vote silently - no lobbying!
- You can put all 3 on one item if you feel strongly
- Vote for what YOU think is most important, not what others might want

Take 2 minutes to place your votes. I'll call time when we're ready to count."

[After voting]

"Great! Let's see what emerged. Our top items are... [READ TOP 3-5]. Any surprises? Quick reactions?"`,
        requiredArtifacts: ['Prioritized Items'],
        type: 'converge',
        swapOptions: [
            {
                name: 'E-S-I Grid',
                description: 'Effort/Scale/Impact Mapping.',
                instructions: 'Move items onto a 2x2 grid based on effort and impact.',
                script: "Let's map these out by effort and impact."
            }
        ]
    },
    WRAP_UP: {
        id: 'wrap_up',
        name: 'Wrap-up',
        duration: 5,
        description: 'Summarize decisions and assign next steps.',
        instructions: `1. Recap the key decisions made today
2. Identify 2-3 concrete next steps
3. Assign owners and due dates for each action
4. Thank everyone and share how notes will be distributed`,
        facilitatorScript: `"Let's wrap up. Here's what we accomplished today:

[SUMMARIZE KEY DECISIONS]

Our next steps are:
1. [ACTION 1] - Owner: [NAME] - Due: [DATE]
2. [ACTION 2] - Owner: [NAME] - Due: [DATE]

I'll send out notes within 24 hours. Any final questions before we close?

Thank you all for your energy and input today. This was productive!"`,
        requiredArtifacts: ['Action Items', 'Owner Assignments'],
        type: 'close',
    }
};

export const RECIPES: WorkshopRecipe[] = [
    {
        type: 'Problem Framing',
        defaultDuration: 60,
        guaranteedOutcomes: ['Problem Definition', 'User Insights', 'Success Metrics'],
        baseAgenda: [
            COMMON_ACTIVITIES.INTRO,
            {
                id: 'problem_map',
                name: 'Problem Mapping',
                duration: 25,
                type: 'diverge',
                description: 'Deep dive into user pain points and journey.',
                instructions: `1. Draw the user journey in 5-7 steps (2 min)
2. Silent brainstorm: Write pain points on sticky notes (5 min)
3. Place pain points on the journey where they occur
4. Group similar pain points together
5. Vote on the most critical pain points to address`,
                facilitatorScript: `"Now we're going to map out the problem space.

First, let's sketch the user journey. Think about the key steps someone takes when [DESCRIBE SCENARIO]. Take 2 minutes to draw 5-7 steps.

[After 2 min]

Now, grab your sticky notes. I want you to write down every pain point, frustration, or problem you've seen or heard about. One per sticky. Work silently for 5 minutes.

[After 5 min]

Great! Now place your stickies on the journey map where that pain point occurs. Let's see what patterns emerge..."`,
                requiredArtifacts: ['Journey Map', 'Pain Points', 'Priority Problems']
            },
            COMMON_ACTIVITIES.VOTING,
            COMMON_ACTIVITIES.WRAP_UP
        ],
    },
    {
        type: 'Ideation',
        defaultDuration: 90,
        guaranteedOutcomes: ['Draft Concepts', 'Priority Solutions'],
        baseAgenda: [
            COMMON_ACTIVITIES.INTRO,
            {
                id: 'crazy_8s',
                name: 'Crazy 8s',
                duration: 20,
                type: 'diverge',
                description: 'Rapid sketching to generate many ideas quickly.',
                instructions: `1. Fold paper into 8 sections
2. You have 60 seconds per box to sketch an idea
3. No talking during sketching - focus on quantity
4. Sketches can be rough - stick figures are fine!
5. After 8 minutes, share your favorite 2 ideas with the group`,
                facilitatorScript: `"Time for Crazy 8s! This is about quantity over quality.

Fold your paper into 8 boxes. You'll have exactly 60 seconds per box to sketch an idea. When I say 'switch,' move to the next box even if you're not done.

Rules:
- No talking during sketching
- Ugly sketches are beautiful sketches
- Steal and remix ideas you've heard

Ready? First box... GO!

[Call 'Switch!' every 60 seconds]

Great work! Now circle your 2 favorite ideas. We'll share those with the group."`,
                requiredArtifacts: ['8 Sketches per Person', 'Top Ideas']
            },
            COMMON_ACTIVITIES.VOTING,
            COMMON_ACTIVITIES.WRAP_UP
        ],
    },
    {
        type: 'Team Collaboration',
        defaultDuration: 45,
        guaranteedOutcomes: ['Working Agreements', 'Communication Channels'],
        baseAgenda: [
            COMMON_ACTIVITIES.INTRO,
            {
                id: 'roles',
                name: 'Role Definition',
                duration: 15,
                type: 'setup',
                description: 'Clarify who owns what and how decisions get made.',
                instructions: `1. List all key responsibilities for this project/team
2. For each responsibility, assign a DRI (Directly Responsible Individual)
3. Clarify decision rights: Who decides? Who is consulted? Who is informed?
4. Document escalation paths for blockers
5. Agree on communication norms (response times, channels)`,
                facilitatorScript: `"Let's get crystal clear on roles and responsibilities.

First, let's list out all the key areas of ownership for this project. What are the main things that need an owner? Call them out and I'll capture them.

[Capture list]

Now, for each one, we need a DRI - a Directly Responsible Individual. This doesn't mean they do all the work, but they're accountable for it getting done.

Let's go through the list. For [FIRST ITEM], who should be the DRI?

[Assign DRIs]

Finally, let's talk about how we communicate. What's our agreement on response times? Which channel for what?"`,
                requiredArtifacts: ['RACI Matrix', 'Communication Norms']
            },
            COMMON_ACTIVITIES.WRAP_UP
        ],
    },
    {
        type: 'Retrospective',
        defaultDuration: 60,
        guaranteedOutcomes: ['Action Items', 'Team Health Pulse'],
        baseAgenda: [
            COMMON_ACTIVITIES.INTRO,
            {
                id: 'retro',
                name: 'Stop, Start, Continue',
                duration: 30,
                type: 'diverge',
                description: 'Reflect on what to change and what to keep doing.',
                instructions: `1. Create 3 columns: Stop, Start, Continue
2. Silent brainstorm (7 min): Write items for each column
3. Group similar items together
4. Discuss top items in each column (15 min)
5. Vote on 2-3 actions to commit to for next sprint`,
                facilitatorScript: `"Time for our retrospective. We're using Stop, Start, Continue.

STOP: What should we stop doing? What's not working?
START: What should we try? What's missing?
CONTINUE: What's working well? What should we keep doing?

Take 7 minutes to silently write your thoughts. One item per sticky note. Be specific - 'communication' is too vague, 'daily standups running over 15 min' is better.

[After 7 min]

Let's share. Place your stickies in the right column. As you place them, read them out loud.

[After sharing]

I see some themes here. Let's discuss [TOP THEME]. What's really going on? What would help?

[Discuss each theme]

Now let's vote. We need 2-3 concrete actions we'll commit to for next sprint."`,
                requiredArtifacts: ['Stop/Start/Continue Board', 'Action Items']
            },
            COMMON_ACTIVITIES.WRAP_UP
        ],
    }
];
