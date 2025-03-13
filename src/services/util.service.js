export function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

export function makeLorem(size = 100) {
    var words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
    var txt = ''
    while (size > 0) {
        size--
        txt += words[Math.floor(Math.random() * words.length)] + ' '
    }
    return txt
}

export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}


export function randomPastTime() {
    const HOUR = 1000 * 60 * 60
    const DAY = 1000 * 60 * 60 * 24
    const WEEK = 1000 * 60 * 60 * 24 * 7

    const pastTime = getRandomIntInclusive(HOUR, WEEK)
    return Date.now() - pastTime
}

export function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => { func.apply(this, args) }, timeout)
    }
}

export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

export function loadFromStorage(key) {
    const data = localStorage.getItem(key)
    return (data) ? JSON.parse(data) : undefined
}



const colors = [
    "#0073ea", "#0060b9", "#f65f7c", "#c3c6d4", "#676879", "#323338",
    "#000000", "#00854d", "#007038", "#bbdbc9", "#d83a52", "#b63546",
    "#f4c3cb", "#1f76c2", "#292f4c", "#aed4fc", "#f2d973",
    "#037f4c", "#116846", "#81bfa5", "#00c875", "#0f9b63", "#80e3ba",
    "#9cd326", "#7ca32b", "#cde992", "#cab641", "#9d8f3e", "#e4daa0",
    "#ffe580", "#fdab3d", "#c0873c", "#fed59e", "#ff6d3b", "#c25531",
    "#ffb196", "#ffadad", "#c2888a", "#ffd6d6", "#ff7575", "#c26163",
    "#ffbaba", "#df2f4a", "#ad3f51", "#f0a1ad", "#bb3354", "#92334c",
    "#dd99a9", "#e50073", "#c20062", "#ff8ac4", "#c24e9a", "#fface1",
    "#faa1f1", "#be80ba", "#fcd0f8", "#9d50dd", "#7d45b0", "#d0aeed",
    "#784bd1", "#6344a3", "#bba5e8", "#7e3b8a", "#673971", "#be9dc4",
    "#401694", "#3c1f78", "#a08bc9", "#5559df", "#4b4ead", "#aaacef",
    "#225091", "#274776", "#90a7c8", "#579bfc", "#4c7cc1", "#abcdfd",
    "#007eb5", "#0f6d97", "#80c2df", "#4eccc6", "#469e9b", "#a6e5e2",
    "#66ccff", "#569ec3", "#b2e5ff", "#74afcc", "#588095", "#b3d0de",
    "#9aadbd", "#7b8895", "#ccd6de", "#c4c4c4", "#98999a", "#e1e1e1",
    "#757575", "#69696a", "#bfbfbf", "#333333", "#222222", "#999999",
    "#7f5347", "#684943", "#bfa9a3", "#e484bd", "#ae5d8d", "#ecbad7",
    "#bca58a", "#8a7862", "#d6cabc", "#a1e3f6", "#81b6c5",
    "#cd9282", "#976758", "#dec0b7", "#216edf", "#225eb7", "#95bbf2",
    "#175a63", "#12484f", "#8bacb1", "#bda8f9", "#9786c7", "#ded4fc",
    "#a9bee8", "#8798ba", "#9d99b9", "#7e7a94", "#ceccdc",
    "#563e3e", "#453232", "#ab9f9f", "#a1a1a1", "#9699a6", "#6b6d77", "#61caf7", "#00d1d1", "#009aff", "#597bfc", "#181d37",
];




export function getRandomColor() {
    return colors[Math.ceil(Math.random() * (colors.length - 1))];
}



// Generates a board name using random adjectives and nouns.
export function generateBoardName() {
    const boardAdjectives = [
        "Innovative", "Dynamic", "Creative", "Bold", "Vibrant",
        "Modern", "Epic", "Visionary", "Ambitious", "Cutting-Edge"
    ];
    const boardNouns = [
        "Strategy", "Journey", "Enterprise", "Project", "Initiative",
        "Concept", "Plan", "Adventure", "Blueprint", "Odyssey"
    ];
    const adjective = boardAdjectives[Math.floor(Math.random() * boardAdjectives.length)];
    const noun = boardNouns[Math.floor(Math.random() * boardNouns.length)];
    return `${adjective} ${noun} Board`;
}

// Generates a group name using descriptors and generic group nouns.
export function generateGroupName() {
    const groupDescriptors = [
        "Backlog", "Sprint", "Milestone", "Iteration", "Planning",
        "Review", "Pipeline", "Priority", "Current", "Upcoming"
    ];
    const groupNouns = [
        "Group", "Cluster", "Division", "Team", "Phase",
        "Segment", "Section", "Unit", "Bundle", "Portfolio"
    ];
    const descriptor = groupDescriptors[Math.floor(Math.random() * groupDescriptors.length)];
    const noun = groupNouns[Math.floor(Math.random() * groupNouns.length)];
    return `${descriptor} ${noun}`;
}

// Generates a task name using action verbs and task targets.
export function generateTaskName() {
    const taskActions = [
        "Design", "Develop", "Test", "Deploy", "Refactor",
        "Review", "Implement", "Optimize", "Integrate", "Update"
    ];
    const taskTargets = [
        "Homepage", "API", "Module", "Component", "Feature",
        "Interface", "Workflow", "Dashboard", "System", "Functionality"
    ];
    const action = taskActions[Math.floor(Math.random() * taskActions.length)];
    const target = taskTargets[Math.floor(Math.random() * taskTargets.length)];
    return `${action} ${target}`;
}

export function generateRandomDate() {
    // Define the start and end dates (months are 0-indexed in JavaScript)
    const startDate = new Date(2024, 9, 1);  // January 1, 1900
    const endDate = new Date(2025, 11, 31);   // December 31, 2100

    // Calculate a random timestamp between the start and end dates
    const randomTimestamp = startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime());

    const randomDate = new Date(randomTimestamp);

    // Extract day, month, and year, ensuring two-digit day and month
    const day = String(randomDate.getDate()).padStart(2, '0');
    const month = String(randomDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = randomDate.getFullYear();

    return `${day}-${month}-${year}`;
}