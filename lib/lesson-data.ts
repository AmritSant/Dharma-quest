export type Lesson = {
  id: string;
  unit: string;
  title: string;
  sanskrit: string;
  duration: number;
  summary: string;
  teaching: string[];
  scenario: string;
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
  practice: string;
  reflection: string;
  color: "saffron" | "violet" | "sky" | "emerald";
};

export type LessonExpansion = {
  hook: {
    title: string;
    body: string;
    choices: [string, string];
  };
  insight: string;
  gita: {
    reference: string;
    theme: string;
    paraphrase: string;
  };
  matchPairs: Array<{ term: string; meaning: string }>;
  myth: {
    statement: string;
    correct: boolean;
    explanation: string;
  };
  challenge:
    | {
        type: "order";
        prompt: string;
        items: string[];
        explanation: string;
      }
    | {
        type: "select";
        prompt: string;
        options: string[];
        correct: number[];
        explanation: string;
      };
  commitments: [string, string, string];
};

export type LessonSource = {
  primary: string;
  form: string;
  edition: string;
  tradition: string;
  note: string;
};

export const lessons: Lesson[] = [
  {
    id: "dharma-context",
    unit: "Foundations",
    title: "Dharma in daily life",
    sanskrit: "धर्म · Dharma",
    duration: 9,
    summary: "Explore purpose, responsibility, and the wisdom of context.",
    teaching: [
      "Dharma can mean an ethical path, sustaining order, responsibility, or the action appropriate to a situation.",
      "It is not always a single fixed rule. Your roles, abilities, circumstances, and the well-being of others can all matter.",
      "A practical question is: What action is honest, responsible, and least harmful here?",
    ],
    scenario:
      "A friend asks you to cover for them after they make a mistake that could hurt another person.",
    question: "Which response best applies dharma thoughtfully?",
    answers: [
      "Protect your friend no matter what",
      "Expose them publicly to teach a lesson",
      "Encourage honesty and help them repair the harm",
      "Ignore the situation completely",
    ],
    correct: 2,
    explanation:
      "Dharma often asks us to balance loyalty with truth and responsibility. Supporting repair preserves care without hiding harm.",
    practice:
      "Choose one responsibility you have been avoiding and give it five undistracted minutes today.",
    reflection: "What made this responsibility worth returning to?",
    color: "saffron",
  },
  {
    id: "karma-intention",
    unit: "Foundations",
    title: "Karma is action",
    sanskrit: "कर्म · Karma",
    duration: 10,
    summary: "Move beyond the idea that karma is instant reward or punishment.",
    teaching: [
      "Karma literally centers on action. Hindu traditions examine action, intention, habit, and consequence in different ways.",
      "A useful daily application is to focus on what you can choose now, rather than trying to control every result.",
      "Repeated actions shape tendencies. A small deliberate choice can become a different pattern.",
    ],
    scenario:
      "You help someone, but they do not thank you. You feel that the action was wasted.",
    question: "Which response reflects karma yoga most closely?",
    answers: [
      "Only help when recognition is guaranteed",
      "Act with care without making praise the price",
      "Demand that the person return the favor",
      "Decide that good actions never matter",
    ],
    correct: 1,
    explanation:
      "Karma yoga emphasizes wholehearted action with less attachment to personal reward. The quality of the action still matters.",
    practice:
      "Do one useful thing today without announcing it or checking whether anyone noticed.",
    reflection: "How did releasing recognition change the experience?",
    color: "sky",
  },
  {
    id: "samatva",
    unit: "Inner steadiness",
    title: "Steady, not numb",
    sanskrit: "समत्व · Samatva",
    duration: 9,
    summary: "Practice equanimity without suppressing what you feel.",
    teaching: [
      "Samatva is often translated as evenness or equanimity.",
      "Equanimity is not pretending that everything feels fine. It is the ability to feel clearly without letting the first impulse control the next action.",
      "A pause creates room for a wiser response.",
    ],
    scenario:
      "You receive a message that sounds dismissive just before an important meeting.",
    question: "What is the most balanced first step?",
    answers: [
      "Send an angry response immediately",
      "Pretend you are not affected",
      "Pause, name the feeling, and respond later",
      "End the relationship",
    ],
    correct: 2,
    explanation:
      "Naming the emotion honors it; pausing prevents it from choosing for you. That is steadiness rather than numbness.",
    practice:
      "Before one stressful response, take four comfortable breaths and silently name what you feel.",
    reflection: "Did the pause change what you wanted to say or do?",
    color: "violet",
  },
  {
    id: "ahimsa-self",
    unit: "Inner steadiness",
    title: "Non-harm includes you",
    sanskrit: "अहिंसा · Ahimsa",
    duration: 9,
    summary: "Turn non-harm into balanced care rather than perfection.",
    teaching: [
      "Ahimsa means non-harm and is a central ethical discipline across several Indian traditions.",
      "Applied inwardly, it asks whether your habits and self-talk create needless harm.",
      "Gentleness does not mean avoiding every challenge. It means choosing challenge without cruelty.",
    ],
    scenario:
      "You miss a workout and think, “I never follow through. I am hopeless.”",
    question: "Which response combines ahimsa with responsibility?",
    answers: [
      "Give up for the week",
      "Punish yourself with an extreme workout",
      "Notice the harsh thought and plan one manageable next step",
      "Pretend the goal never mattered",
    ],
    correct: 2,
    explanation:
      "A manageable next step protects the body and preserves commitment. Ahimsa changes the method, not the value of growth.",
    practice:
      "Take a gentle seven-minute walk or mobility break. Choose a seated version if that serves your body better.",
    reflection: "What did your body need more of today: movement, ease, or rest?",
    color: "emerald",
  },
  {
    id: "four-yogas",
    unit: "Paths of practice",
    title: "Four paths of yoga",
    sanskrit: "योग · Yoga",
    duration: 11,
    summary: "Meet the paths of action, devotion, knowledge, and meditation.",
    teaching: [
      "Yoga is broader than physical postures. Hindu traditions describe several complementary paths of spiritual practice.",
      "Karma yoga emphasizes selfless action; bhakti yoga, devotion; jnana yoga, discerning inquiry; and raja yoga, disciplined meditation.",
      "People may lean toward one path while learning from the others.",
    ],
    scenario:
      "You feel most connected when volunteering, but you assume that this cannot be spiritual practice.",
    question: "Which path most directly reframes service as practice?",
    answers: ["Bhakti yoga", "Karma yoga", "Jnana yoga", "Raja yoga"],
    correct: 1,
    explanation:
      "Karma yoga transforms action through intention, service, and reduced attachment to personal reward.",
    practice:
      "Turn one ordinary task into service: do it carefully for the benefit of someone beyond yourself.",
    reflection: "How did your intention change the task?",
    color: "saffron",
  },
  {
    id: "atman-brahman",
    unit: "Philosophy",
    title: "Self and ultimate reality",
    sanskrit: "आत्मन् · ब्रह्मन्",
    duration: 12,
    summary: "Understand Atman and Brahman without flattening diverse schools.",
    teaching: [
      "Atman can refer to the deepest self; Brahman to ultimate reality. Their relationship is understood differently across Hindu schools.",
      "Advaita emphasizes non-duality. Vishishtadvaita describes unity with real distinction. Dvaita emphasizes an enduring difference between individual self and the Divine.",
      "The goal is not to force one answer, but to understand the questions each school is addressing.",
    ],
    scenario:
      "Two teachers give different explanations of the relationship between the self and the Divine.",
    question: "What is the most accurate conclusion?",
    answers: [
      "One of them cannot be Hindu",
      "Hindu philosophy contains multiple reasoned schools",
      "The concepts have no meaning",
      "Every school teaches exactly the same thing",
    ],
    correct: 1,
    explanation:
      "Hinduism contains multiple philosophical lineages with genuine differences. Respectful learning names those differences instead of erasing them.",
    practice:
      "Sit quietly for three minutes and notice: which parts of experience change, and what is aware of the change?",
    reflection: "What felt changing, and what felt continuous?",
    color: "violet",
  },
  {
    id: "bhakti",
    unit: "Paths of practice",
    title: "The intelligence of devotion",
    sanskrit: "भक्ति · Bhakti",
    duration: 9,
    summary: "Explore devotion as relationship, attention, and love.",
    teaching: [
      "Bhakti is a path of loving devotion. It can be expressed through prayer, music, remembrance, ritual, poetry, and service.",
      "Different communities relate to forms of the Divine in distinct ways. Learning about bhakti does not require adopting a devotional practice.",
      "Its everyday lesson is that sustained loving attention changes how we relate to what we value.",
    ],
    scenario:
      "A learner from another religion is curious about bhakti but does not want to perform Hindu worship.",
    question: "How should the app guide them?",
    answers: [
      "Require a ritual to finish",
      "Tell them bhakti is not for them",
      "Offer cultural learning and an optional gratitude practice",
      "Hide the topic entirely",
    ],
    correct: 2,
    explanation:
      "The concept can be taught accurately while devotional actions remain optional. Curiosity does not require conversion.",
    practice:
      "Give two uninterrupted minutes of appreciative attention to a person, value, or sacred relationship meaningful to you.",
    reflection: "What became more vivid when you gave it full attention?",
    color: "emerald",
  },
  {
    id: "seva",
    unit: "Living wisdom",
    title: "Service without spotlight",
    sanskrit: "सेवा · Seva",
    duration: 9,
    summary: "Practice service as attention to what genuinely helps.",
    teaching: [
      "Seva is commonly understood as service offered with humility and care.",
      "Helpful service begins by noticing what is actually needed rather than performing generosity for praise.",
      "Small reliable acts often matter more than dramatic gestures.",
    ],
    scenario:
      "You want to help a classmate who appears overwhelmed.",
    question: "Which approach best reflects thoughtful seva?",
    answers: [
      "Assume what they need and take over",
      "Ask what would help and respect their answer",
      "Post about helping them first",
      "Wait until you can do something impressive",
    ],
    correct: 1,
    explanation:
      "Service respects the agency of the person receiving it. Asking and listening keeps help centered on their needs.",
    practice:
      "Offer one specific, manageable form of help—or quietly improve a shared space.",
    reflection: "What made the action useful rather than performative?",
    color: "sky",
  },
  {
    id: "gita-context",
    unit: "Bhagavad Gita",
    title: "Enter the conversation",
    sanskrit: "गीता · Gita 1–2",
    duration: 10,
    summary: "Meet the Gita as an ethical conversation, not a collection of isolated slogans.",
    teaching: [
      "The Bhagavad Gita unfolds inside the Mahabharata as a conversation between the warrior Arjuna and Krishna, his charioteer and teacher.",
      "Arjuna is overwhelmed by a conflict in which every available choice carries moral cost. He pauses, admits confusion, and asks for guidance.",
      "Reading the Gita well means keeping its dramatic setting, its many layers of teaching, and the diversity of Hindu interpretation in view.",
    ],
    scenario: "Someone shares one Gita verse online as proof that every difficult decision has one simple answer.",
    question: "What is the wisest way to respond?",
    answers: [
      "Accept the verse without context",
      "Reject the whole text as contradictory",
      "Read the verse within the dialogue and compare interpretations",
      "Use only the translation that confirms your view",
    ],
    correct: 2,
    explanation: "The Gita is a sustained dialogue about action, knowledge, devotion, self, and liberation. Context makes a verse more meaningful, not less.",
    practice: "Before using a quote as advice today, read the paragraph around it and ask what problem it was answering.",
    reflection: "How did context change the meaning you first noticed?",
    color: "saffron",
  },
  {
    id: "gita-action",
    unit: "Bhagavad Gita",
    title: "Work without clinging",
    sanskrit: "कर्मयोग · Gita 2.47–48",
    duration: 10,
    summary: "Learn how committed action and release of control can coexist.",
    teaching: [
      "The Gita does not ask Arjuna to become passive. It repeatedly directs attention toward disciplined, appropriate action.",
      "Non-attachment means releasing the demand that one desired outcome must validate your effort. It does not mean ignoring consequences or quality.",
      "This distinction can reduce anxious rumination while preserving preparation, care, and accountability.",
    ],
    scenario: "You prepared carefully for an interview but cannot stop imagining every possible result.",
    question: "Which response best reflects the Gita’s approach?",
    answers: [
      "Stop caring how you perform",
      "Prepare fully, act attentively, and release what is no longer yours to control",
      "Assume destiny makes preparation pointless",
      "Measure your worth by the final decision",
    ],
    correct: 1,
    explanation: "The practice joins wholehearted effort with humility about control. You are responsible for the quality of your action, not mastery over every consequence.",
    practice: "Choose one uncertain task. Write two columns: ‘my action’ and ‘not mine to control,’ then do the first useful action.",
    reflection: "What energy returned when you separated effort from outcome?",
    color: "sky",
  },
  {
    id: "gita-mind",
    unit: "Bhagavad Gita",
    title: "Return the wandering mind",
    sanskrit: "ध्यान · Gita 6.26",
    duration: 9,
    summary: "Practice attention as a patient return rather than a test of perfect concentration.",
    teaching: [
      "In its discussion of meditation, the Gita acknowledges that the mind wanders. The instruction is to notice and bring it back.",
      "The return is the repetition that trains attention. Wandering is not proof that meditation failed.",
      "A brief, regular practice can support steadier awareness, but it is not a substitute for professional mental-health care when that is needed.",
    ],
    scenario: "Thirty seconds into a quiet practice, you realize you have been planning dinner.",
    question: "What counts as the practice in that moment?",
    answers: [
      "Start judging yourself",
      "Quit because concentration was broken",
      "Notice the wandering and gently return attention",
      "Force every thought to disappear",
    ],
    correct: 2,
    explanation: "The moment of noticing is not outside meditation. It is the doorway back into it.",
    practice: "For two minutes, feel one natural breath at a time. Whenever attention wanders, silently say ‘return’ and begin again.",
    reflection: "Could you treat returning as success instead of failure?",
    color: "violet",
  },
  {
    id: "gita-devotion",
    unit: "Bhagavad Gita",
    title: "Devotion becomes character",
    sanskrit: "भक्ति · Gita 12.13–14",
    duration: 10,
    summary: "Explore devotion through compassion, humility, steadiness, and care.",
    teaching: [
      "The Gita’s vision of devotion is not limited to ceremony. It also describes the qualities a devotee cultivates in relationship with others.",
      "Compassion, freedom from possessiveness, patience, and steadiness make devotion visible in daily conduct.",
      "Learners from any background can study these teachings comparatively without being asked to adopt a religious commitment.",
    ],
    scenario: "A person speaks beautifully about devotion but regularly treats service workers with contempt.",
    question: "What would the Gita’s character-based lens ask us to notice?",
    answers: [
      "Only public ritual matters",
      "Devotion should shape compassion and conduct",
      "Harshness proves spiritual confidence",
      "Private belief has no relationship to action",
    ],
    correct: 1,
    explanation: "The qualities associated with devotion include how one meets living beings. Reverence that never reaches conduct remains incomplete.",
    practice: "Let one valued belief become visible as patient, respectful attention toward someone you might usually overlook.",
    reflection: "What changed when devotion became a quality of attention?",
    color: "emerald",
  },
];

export const lessonExpansions: Record<string, LessonExpansion> = {
  "dharma-context": {
    hook: {
      title: "Two promises, one evening",
      body: "You promised to help a friend study. Then a family member calls with an urgent need. Both relationships matter, and there is no perfect answer waiting in a rulebook.",
      choices: ["Keep the first promise", "Respond to the urgent need"],
    },
    insight:
      "Dharma is practical discernment. It asks you to see the whole situation—your role, your capacity, who may be harmed, and what honesty requires—before acting.",
    gita: {
      reference: "Bhagavad Gita 18.47",
      theme: "Your path, honestly lived",
      paraphrase: "It can be wiser to live your own responsibility imperfectly than to imitate someone else’s path beautifully.",
    },
    matchPairs: [
      { term: "Dharma", meaning: "What sustains ethical life and right relationship" },
      { term: "Context", meaning: "The roles and circumstances shaping a choice" },
      { term: "Discernment", meaning: "Carefully seeing what this moment asks" },
    ],
    myth: {
      statement: "Dharma always gives everyone the same fixed rule.",
      correct: false,
      explanation:
        "Hindu traditions include duties and principles, but applying them often requires attention to context, competing responsibilities, and consequences.",
    },
    challenge: {
      type: "order",
      prompt: "Build a dharmic decision process.",
      items: ["Pause before reacting", "Name the people and duties involved", "Choose the honest, least-harmful action"],
      explanation: "A pause creates room to see the full context before choosing and acting.",
    },
    commitments: ["Give one responsibility five focused minutes", "Have one honest, caring conversation", "Repair one small promise I missed"],
  },
  "karma-intention": {
    hook: {
      title: "The thank-you that never came",
      body: "You spend an hour helping someone. They leave without acknowledging it. The action was useful, but your mind keeps asking whether it was worth doing.",
      choices: ["The help still mattered", "Without praise, it was wasted"],
    },
    insight:
      "Karma yoga does not make outcomes irrelevant. It trains you to act skillfully while loosening the demand that a particular result, reward, or identity must follow.",
    gita: {
      reference: "Bhagavad Gita 2.47",
      theme: "Your work is yours; every result is not",
      paraphrase: "Give yourself fully to the action you can take without treating the outcome as something you completely control.",
    },
    matchPairs: [
      { term: "Karma", meaning: "Action and its shaping consequences" },
      { term: "Intention", meaning: "The aim carried into an action" },
      { term: "Attachment", meaning: "Demanding that one result must occur" },
    ],
    myth: {
      statement: "Karma means every hardship is a punishment someone deserved.",
      correct: false,
      explanation:
        "That claim oversimplifies diverse teachings and can become victim-blaming. Karma is not a license to judge another person’s suffering.",
    },
    challenge: {
      type: "select",
      prompt: "Select everything you can directly shape.",
      options: ["Your intention", "Your effort", "Everyone’s reaction", "Your next response"],
      correct: [0, 1, 3],
      explanation: "You can shape intention, effort, and response. Other people’s reactions remain outside complete control.",
    },
    commitments: ["Do one useful thing without announcing it", "Focus on effort during one uncertain task", "Release one result I keep replaying"],
  },
  samatva: {
    hook: {
      title: "The message before the meeting",
      body: "A dismissive text arrives just as you need to focus. Your chest tightens, and the perfect comeback appears immediately.",
      choices: ["Send it now", "Pause and return later"],
    },
    insight:
      "Samatva is a steady center, not a blank emotional life. You can fully acknowledge anger, fear, or excitement without handing it control of the next action.",
    gita: {
      reference: "Bhagavad Gita 2.48",
      theme: "Balance is part of yoga",
      paraphrase: "Act with steadiness in both success and disappointment; this evenness is itself a form of yoga.",
    },
    matchPairs: [
      { term: "Feeling", meaning: "Information arising in your experience" },
      { term: "Impulse", meaning: "The first urge to act" },
      { term: "Response", meaning: "The action you deliberately choose" },
    ],
    myth: {
      statement: "Equanimity means becoming emotionally numb.",
      correct: false,
      explanation: "Numbness disconnects from feeling. Equanimity notices feeling clearly and creates space for a wiser response.",
    },
    challenge: {
      type: "order",
      prompt: "Put the steady-response sequence in order.",
      items: ["Notice the body", "Name the emotion", "Choose the next action"],
      explanation: "Body awareness and precise naming slow the impulse enough for choice to return.",
    },
    commitments: ["Take four breaths before one reply", "Name one feeling without judging it", "Wait ten minutes before a heated decision"],
  },
  "ahimsa-self": {
    hook: {
      title: "Motivation or punishment?",
      body: "You miss a goal and hear a harsh inner voice: ‘Push twice as hard tomorrow or you are weak.’ It sounds disciplined, but it leaves you exhausted.",
      choices: ["Harshness creates discipline", "Care can support discipline"],
    },
    insight:
      "Ahimsa toward yourself is not permission to abandon growth. It changes the fuel: from shame and punishment to honesty, proportion, recovery, and sustainable effort.",
    gita: {
      reference: "Bhagavad Gita 16.2–3",
      theme: "Strength without cruelty",
      paraphrase: "Nonviolence, truthfulness, compassion, patience, and steadiness are qualities that support a wiser life.",
    },
    matchPairs: [
      { term: "Ahimsa", meaning: "Reducing unnecessary harm" },
      { term: "Discipline", meaning: "A repeatable commitment to what matters" },
      { term: "Rest", meaning: "Recovery that protects future capacity" },
    ],
    myth: {
      statement: "Practicing non-harm means avoiding every difficult or uncomfortable experience.",
      correct: false,
      explanation: "Useful challenge can strengthen you. Ahimsa asks whether the method creates needless injury, cruelty, or depletion.",
    },
    challenge: {
      type: "select",
      prompt: "Which responses combine compassion with accountability?",
      options: ["Choose one manageable next step", "Call yourself lazy", "Adjust the plan to your capacity", "Give up permanently"],
      correct: [0, 2],
      explanation: "A manageable plan and honest adjustment preserve both care and responsibility.",
    },
    commitments: ["Replace one insult with a useful instruction", "Choose gentle movement or real rest", "Make tomorrow’s goal smaller and repeatable"],
  },
  "four-yogas": {
    hook: {
      title: "Four doors into practice",
      body: "One person finds meaning while serving, another through prayer, another through inquiry, and another in meditation. Hindu traditions make room for all four temperaments.",
      choices: ["Choose only one forever", "Let the paths support one another"],
    },
    insight:
      "The yogas are not personality boxes. They are trainable approaches—action, devotion, knowledge, and meditation—that can balance one another across a lifetime.",
    gita: {
      reference: "Bhagavad Gita 4.11",
      theme: "Many approaches, a shared horizon",
      paraphrase: "People approach the sacred in different ways; each sincere path can become a way of relationship and growth.",
    },
    matchPairs: [
      { term: "Karma yoga", meaning: "Transforming action through service" },
      { term: "Bhakti yoga", meaning: "Cultivating loving devotion" },
      { term: "Jnana yoga", meaning: "Using inquiry and discernment" },
      { term: "Raja yoga", meaning: "Training attention and meditation" },
    ],
    myth: {
      statement: "In Hindu traditions, yoga only means physical postures.",
      correct: false,
      explanation: "Postural practice is one part of a much wider family of disciplines concerned with action, devotion, knowledge, ethics, and meditation.",
    },
    challenge: {
      type: "select",
      prompt: "Which can be genuine forms of yoga?",
      options: ["Serving without seeking praise", "Reflecting on the nature of self", "Remembering the Divine with love", "Only performing difficult poses"],
      correct: [0, 1, 2],
      explanation: "Service, inquiry, and devotion each correspond to established yogic paths; yoga is broader than advanced poses.",
    },
    commitments: ["Turn one chore into karma yoga", "Give two minutes to silent attention", "Ask one honest question about the self"],
  },
  "atman-brahman": {
    hook: {
      title: "What remains while you change?",
      body: "Your body, opinions, roles, and emotions have changed across your life. Yet you still say ‘I.’ Hindu philosophers ask what that word ultimately points toward.",
      choices: ["A changing personal story", "A deeper ground of awareness"],
    },
    insight:
      "Atman and Brahman open a shared philosophical question, not one universally agreed answer. Learning the distinctions between schools is part of respecting Hindu thought.",
    gita: {
      reference: "Bhagavad Gita 2.20",
      theme: "The deepest self is not temporary",
      paraphrase: "The Gita describes the deepest self as unborn and enduring, not destroyed when the body changes or dies.",
    },
    matchPairs: [
      { term: "Advaita", meaning: "Emphasizes non-duality" },
      { term: "Vishishtadvaita", meaning: "Unity with real distinction" },
      { term: "Dvaita", meaning: "Enduring difference between self and Divine" },
    ],
    myth: {
      statement: "Every Hindu school teaches exactly the same relationship between Atman and Brahman.",
      correct: false,
      explanation: "The schools share vocabulary and questions while offering genuinely different arguments about self, world, and ultimate reality.",
    },
    challenge: {
      type: "order",
      prompt: "Build a respectful inquiry.",
      items: ["Observe what changes", "Ask what is aware of change", "Compare how different schools answer"],
      explanation: "Experience begins the inquiry; philosophical traditions then offer distinct frameworks for interpreting it.",
    },
    commitments: ["Sit with the question ‘What is aware?’", "Notice one role without reducing myself to it", "Explain two schools without declaring a winner"],
  },
  bhakti: {
    hook: {
      title: "Attention changes relationship",
      body: "A song, prayer, memory, or act of gratitude can make what you value feel vividly present. Bhakti turns that loving attention toward the sacred.",
      choices: ["Devotion is only emotion", "Devotion can be a disciplined path"],
    },
    insight:
      "Bhakti can be intimate and emotional, but it also involves practice: returning attention, softening self-centeredness, and nurturing a relationship with the Divine.",
    gita: {
      reference: "Bhagavad Gita 9.26",
      theme: "Devotion is measured by sincerity",
      paraphrase: "Even a leaf, flower, fruit, or water becomes a meaningful offering when it is given with genuine devotion.",
    },
    matchPairs: [
      { term: "Shravana", meaning: "Listening to sacred stories or teachings" },
      { term: "Kirtana", meaning: "Singing or reciting sacred names" },
      { term: "Smarana", meaning: "Remembering the Divine" },
    ],
    myth: {
      statement: "Learning about bhakti requires converting or performing worship.",
      correct: false,
      explanation: "Anyone can learn the history and meaning of bhakti. Personal devotional participation should remain freely chosen.",
    },
    challenge: {
      type: "select",
      prompt: "Which can express bhakti in Hindu traditions?",
      options: ["Sacred song", "Prayerful remembrance", "Humble service", "Demanding one identical practice from everyone"],
      correct: [0, 1, 2],
      explanation: "Song, remembrance, and service can all carry devotion; bhakti traditions are diverse rather than uniform.",
    },
    commitments: ["Offer two minutes of undistracted gratitude", "Listen to a devotional poem or song", "Care for something I hold sacred"],
  },
  seva: {
    hook: {
      title: "Help that actually helps",
      body: "You notice a classmate struggling. Taking over might make you feel useful, but asking first could reveal that they need something completely different.",
      choices: ["Act immediately without asking", "Listen before deciding how to help"],
    },
    insight:
      "Seva is shaped by humility. The giver is not the hero of the story; the real question is whether the action respects agency and meets an actual need.",
    gita: {
      reference: "Bhagavad Gita 3.20",
      theme: "Act for the well-being of the whole",
      paraphrase: "Wise action is not only personal achievement; it can help sustain the shared world around us.",
    },
    matchPairs: [
      { term: "Seva", meaning: "Service offered with humility" },
      { term: "Listening", meaning: "Learning what help is actually wanted" },
      { term: "Non-attachment", meaning: "Serving without making praise the goal" },
    ],
    myth: {
      statement: "Service only matters when it is large, public, or impressive.",
      correct: false,
      explanation: "Small, reliable actions often meet needs better than dramatic gestures. Public recognition is not what makes service meaningful.",
    },
    challenge: {
      type: "order",
      prompt: "Put thoughtful service in order.",
      items: ["Ask what would help", "Listen and respect the answer", "Act within your capacity", "Step back without seeking credit"],
      explanation: "Seva begins with attention and ends without turning the other person’s need into your performance.",
    },
    commitments: ["Offer one specific form of help", "Quietly improve a shared space", "Listen fully without trying to fix"],
  },
  "gita-context": {
    hook: {
      title: "When every option feels costly",
      body: "Arjuna does not begin the Gita as a calm expert. He sees teachers, relatives, and friends on both sides of a devastating conflict, and his certainty collapses.",
      choices: ["Hide the confusion", "Admit the conflict and seek guidance"],
    },
    insight: "The Gita begins with moral distress. Arjuna’s willingness to name his confusion creates the space for a deep conversation about duty, self, action, knowledge, and devotion.",
    gita: {
      reference: "Bhagavad Gita 2.7",
      theme: "Confusion can become inquiry",
      paraphrase: "Arjuna admits that he cannot clearly see his duty and asks Krishna to teach him what would truly serve the good.",
    },
    matchPairs: [
      { term: "Arjuna", meaning: "The questioner facing an ethical crisis" },
      { term: "Krishna", meaning: "The charioteer who becomes teacher" },
      { term: "Samvada", meaning: "A dialogue that develops understanding" },
    ],
    myth: {
      statement: "The Bhagavad Gita is a list of independent motivational quotes.",
      correct: false,
      explanation: "Its verses belong to an unfolding dialogue in a particular epic setting. Theme, speaker, chapter, and interpretive tradition all affect meaning.",
    },
    challenge: {
      type: "order",
      prompt: "Build a context-aware way to read a verse.",
      items: ["Notice the speaker and situation", "Read the surrounding argument", "Compare responsible interpretations"],
      explanation: "Context comes before confident application. It helps a verse illuminate a problem without becoming a slogan.",
    },
    commitments: ["Read five verses as one conversation", "Look up who is speaking before sharing a quote", "Name one hard question without rushing to solve it"],
  },
  "gita-action": {
    hook: {
      title: "The result is still unknown",
      body: "You have prepared carefully for something that matters. More planning will not give you control over the final decision, but your mind keeps bargaining with the future.",
      choices: ["Keep trying to control the result", "Return attention to the next action"],
    },
    insight: "Non-attachment is not lower standards. It directs energy toward preparation, ethical action, and presence while releasing the fantasy of total control.",
    gita: {
      reference: "Bhagavad Gita 3.19",
      theme: "Committed action can be freeing",
      paraphrase: "Do the work that is yours to do without clinging; steady action offered in this spirit can become a path toward freedom.",
    },
    matchPairs: [
      { term: "Effort", meaning: "The care and energy you can offer" },
      { term: "Outcome", meaning: "A result shaped by many conditions" },
      { term: "Non-attachment", meaning: "Working without making one result your identity" },
    ],
    myth: {
      statement: "Not clinging to results means you should not plan or care about consequences.",
      correct: false,
      explanation: "The teaching asks for skillful, responsible action. Releasing control is different from abandoning care, learning, or accountability.",
    },
    challenge: {
      type: "select",
      prompt: "Which belong inside your circle of action?",
      options: ["Preparing with care", "Acting by your values", "Guaranteeing another person’s response", "Learning from what happens"],
      correct: [0, 1, 3],
      explanation: "Preparation, values, and learning remain yours. Another person’s response cannot be guaranteed.",
    },
    commitments: ["Do the next useful action before checking the outcome", "Write down what is not mine to control", "Measure today by care, not applause"],
  },
  "gita-mind": {
    hook: {
      title: "There goes the mind again",
      body: "You sit for one quiet minute. Within seconds, attention is replaying yesterday and rehearsing tomorrow. Then you notice.",
      choices: ["That means I failed", "Noticing is the moment I can return"],
    },
    insight: "Attention is trained through returning. The aim is not violent control of thought but a patient capacity to notice where the mind went and guide it back.",
    gita: {
      reference: "Bhagavad Gita 6.26",
      theme: "Return, as often as needed",
      paraphrase: "Whenever the restless mind wanders, notice it and steadily bring attention back under the guidance of the deeper self.",
    },
    matchPairs: [
      { term: "Wandering", meaning: "Attention moving away without intention" },
      { term: "Awareness", meaning: "Recognizing where attention has gone" },
      { term: "Return", meaning: "Gently beginning again with the chosen focus" },
    ],
    myth: {
      statement: "A successful meditation contains no thoughts or distractions.",
      correct: false,
      explanation: "Thoughts can arise during practice. Recognizing distraction and returning without hostility is part of training the mind.",
    },
    challenge: {
      type: "order",
      prompt: "Put the return practice in order.",
      items: ["Notice attention wandered", "Release self-judgment", "Return to one natural breath"],
      explanation: "Awareness, kindness, and a simple anchor turn distraction into another repetition of the practice.",
    },
    commitments: ["Practice ten gentle returns", "Use one breath before opening an app", "Let noticing count as progress"],
  },
  "gita-devotion": {
    hook: {
      title: "What makes devotion visible?",
      body: "A beautiful prayer can move the heart. The Gita also asks what happens after the prayer—in patience, compassion, humility, and the way we meet others.",
      choices: ["Devotion stays inside ritual", "Devotion reshapes character"],
    },
    insight: "Bhakti is relationship with the Divine, and relationship forms character. The Gita describes devotion through qualities that can be recognized in ordinary encounters.",
    gita: {
      reference: "Bhagavad Gita 12.13–14",
      theme: "Reverence becomes a way of being",
      paraphrase: "A devoted person is described as compassionate, free from possessiveness, patient in difficulty, steady, and committed in heart and mind.",
    },
    matchPairs: [
      { term: "Bhakti", meaning: "A path of loving devotion" },
      { term: "Compassion", meaning: "Responding to suffering with care" },
      { term: "Humility", meaning: "Releasing the need to make oneself superior" },
    ],
    myth: {
      statement: "Devotion can be measured only by the size or complexity of a ritual.",
      correct: false,
      explanation: "Ritual can matter deeply, but the Gita also emphasizes sincerity, remembrance, compassion, and transformed conduct.",
    },
    challenge: {
      type: "select",
      prompt: "Which qualities can make devotion visible in daily life?",
      options: ["Patience", "Compassion", "Contempt for outsiders", "Steadiness"],
      correct: [0, 1, 3],
      explanation: "Patience, compassion, and steadiness express the character described in the Gita’s devotion teachings.",
    },
    commitments: ["Offer one task with loving attention", "Meet one person without superiority", "Remember what is sacred before reacting"],
  },
};

export const lessonSources: Record<string, LessonSource> = {
  "dharma-context": {
    primary: "Bhagavad Gita 18.47, read within the larger conversation on action and responsibility",
    form: "Editorial summary with an interpretive paraphrase; not a direct translation",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "A practical introductory lens; dharma is interpreted differently across Hindu communities and philosophical schools",
    note: "The lesson emphasizes contextual discernment. It does not reduce dharma to a single universal rule.",
  },
  "karma-intention": {
    primary: "Bhagavad Gita 2.47–48 and 3.19",
    form: "Editorial synthesis and plain-language interpretive paraphrase",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Karma yoga as taught in the Bhagavad Gita",
    note: "Hindu traditions differ in how they explain karma, intention, duty, grace, and the results of action.",
  },
  samatva: {
    primary: "Bhagavad Gita 2.48",
    form: "Editorial summary and practical application",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Gita-based teaching on equanimity",
    note: "Equanimity is presented as steadiness with feeling, not emotional suppression.",
  },
  "ahimsa-self": {
    primary: "Yoga Sutra 2.30, with broader Hindu and Indian ethical traditions of ahimsa",
    form: "Editorial summary and contemporary wellness application",
    edition: "Conceptual reference only; no translated passage is reproduced",
    tradition: "Yoga ethics with cross-tradition context",
    note: "Ahimsa is understood in multiple Hindu, Jain, and Buddhist traditions; this lesson focuses on a bounded daily-life application.",
  },
  "four-yogas": {
    primary: "Bhagavad Gita teachings on action, devotion, knowledge, and meditation",
    form: "Modern introductory framework rather than a single canonical four-item list",
    edition: "Editorial synthesis; no translated passage is reproduced",
    tradition: "Karma, bhakti, jnana, and raja/meditative yoga as a modern teaching framework",
    note: "Lineages organize and name yogic paths differently. These paths can overlap rather than function as exclusive categories.",
  },
  "atman-brahman": {
    primary: "Principal Upanishads and later Vedanta commentarial traditions",
    form: "Comparative philosophical summary",
    edition: "Conceptual synthesis; no translated passage is reproduced",
    tradition: "Advaita, Vishishtadvaita, and Dvaita Vedanta",
    note: "The schools make real, reasoned, and important distinctions; the lesson does not present one as the only Hindu view.",
  },
  bhakti: {
    primary: "Bhagavad Gita 12.13–14 and bhakti traditions",
    form: "Editorial summary and interpretive paraphrase",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Bhakti traditions, introduced without privileging a single deity or lineage",
    note: "Devotional practices and theological understandings vary widely across Hindu communities.",
  },
  seva: {
    primary: "Bhagavad Gita 3.19, karma-yoga traditions, and later teachings on seva",
    form: "Editorial synthesis and practical application",
    edition: "Conceptual reference only; no translated passage is reproduced",
    tradition: "Service understood through karma yoga and living devotional traditions",
    note: "Seva can be communal, devotional, institutional, or informal; this lesson uses one accessible daily-life form.",
  },
  "gita-context": {
    primary: "Bhagavad Gita 1.1–2.11",
    form: "Narrative and historical-literary orientation",
    edition: "Editorial summary; consult a complete translation for the full dialogue",
    tradition: "Bhagavad Gita within the Mahabharata",
    note: "The text has been interpreted through many Vedanta, bhakti, yoga, and modern commentarial traditions.",
  },
  "gita-action": {
    primary: "Bhagavad Gita 2.47–48",
    form: "Plain-language interpretive paraphrase and practical application",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Karma yoga",
    note: "Non-attachment does not mean indifference to skill, ethics, or consequences.",
  },
  "gita-mind": {
    primary: "Bhagavad Gita 6.26",
    form: "Plain-language interpretive paraphrase and meditation guidance",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Gita meditation teaching",
    note: "The lesson offers general contemplative education, not medical or mental-health treatment.",
  },
  "gita-devotion": {
    primary: "Bhagavad Gita 12.13–14",
    form: "Plain-language interpretive paraphrase and character reflection",
    edition: "Original editorial wording; no named translation or edition was supplied. Scholar review pending.",
    tradition: "Bhakti yoga in the Bhagavad Gita",
    note: "Bhakti includes diverse ritual, relational, philosophical, and community expressions.",
  },
};

export const quickReviews = [
  { lessonId: "ahimsa-self", prompt: "How can ahimsa change a difficult habit?", answer: "Choose responsibility without cruelty", detail: "A manageable next step supports care for yourself and others." },
  { lessonId: "atman-brahman", prompt: "Do all Vedanta schools explain Atman and Brahman in the same way?", answer: "No. Their relationship is a real philosophical difference", detail: "Advaita, Vishishtadvaita, and Dvaita offer distinct accounts; naming the school matters." },
  { lessonId: "bhakti", prompt: "What is bhakti?", answer: "A path of loving devotion", detail: "Prayer, remembrance, poetry, ritual, and service can express devotion differently across communities." },
  { lessonId: "seva", prompt: "What makes service thoughtful?", answer: "Attention to actual needs and the other person’s agency", detail: "Help should respect what another person wants and needs, rather than centering recognition for the giver." },
  { lessonId: "gita-context", prompt: "Who are the speakers in the Bhagavad Gita?", answer: "Krishna and Arjuna", detail: "Their conversation unfolds within the Mahabharata and has many philosophical and devotional interpretations." },
  { lessonId: "gita-devotion", prompt: "Which qualities express devotion in Gita 12.13–14?", answer: "Compassion, patience, humility, and steadiness", detail: "The teaching considers conduct and sincerity alongside devotional practice." },
  {
    lessonId: "dharma-context",
    prompt: "What makes a dharmic choice more than simply following one fixed rule?",
    answer: "Attention to context, responsibility, honesty, and harm",
    detail: "Dharma asks what sustains right relationship in the actual situation, while traditions may weigh duties differently.",
  },
  {
    lessonId: "samatva",
    prompt: "Which idea describes steadiness without emotional suppression?",
    answer: "Samatva",
    detail: "Equanimity creates space between feeling and action.",
  },
  {
    lessonId: "karma-intention",
    prompt: "What does karma yoga change first: the action or your relationship to its result?",
    answer: "Your relationship to the result",
    detail: "The practice emphasizes skillful action with less attachment to reward.",
  },
  {
    lessonId: "four-yogas",
    prompt: "Which path emphasizes discerning inquiry?",
    answer: "Jnana yoga",
    detail: "Jnana uses inquiry and discernment in the search for liberating knowledge.",
  },
  {
    lessonId: "gita-mind",
    prompt: "In the Gita’s meditation teaching, what should you do when attention wanders?",
    answer: "Notice and gently return",
    detail: "Bhagavad Gita 6.26 treats returning the wandering mind as part of the practice.",
  },
  {
    lessonId: "gita-action",
    prompt: "Does non-attachment mean caring less about the quality of your work?",
    answer: "No",
    detail: "The Gita joins wholehearted action with less clinging to outcomes you cannot fully control.",
  },
];
