import { storageService } from '../async-storage.service';
import { generateBoardName, generateGroupName, generateTaskName, getRandomColor, makeId } from '../util.service';
import { priorityList, STATUS_COLORS, statusList } from './board-values';

const STORAGE_KEY = 'boardDB';

export const boardService = {
    // CRUD Operations for Boards
    query,
    save,
    remove,
    getBoards,
    getById,
    // Utility Functions
    getRandomStatus,
    getRandomPriority,
    getRandomMembers,
    getRandomDate,
    // Empty Templates and Generators
    getEmptyBoard,
    getEmptyGroup,
    getEmptyTask,
    generateBoard,
    generateGroup,
    generateTask,
    // Message Operations
    addBoardMsg,
    // Filter
    getEmptyFilter,
    getDateFilters,
    // Storage Key
    STORAGE_KEY,
    getMemberTaskDistribution,
    getMemberChartConfig,
    getChartDataFromBoard,
    getMemberChartConfig,
    getChartConfig,
    getPriorityDataFromBoard,
};


// Chart-related constants and utilities


export const allMembers = [
    { name: "Dor", label: "Dor", value: "Dor", color: "#2a5699" },
    { name: "Ariel", label: "Ariel", value: "Ariel", color: "#e4901c" },
    { name: "Afik", label: "Afik", value: "Afik", color: "#fb275d" }
]

_checkForDummyData();

// Dummy data feeder
async function _checkForDummyData() {
    let boards = await storageService.query(STORAGE_KEY);
    if (boards && boards.length > 0) return boards;

    boards = Array.from({ length: 2 }, () => generateBoard());
    await storageService._save(STORAGE_KEY, boards);
    return boards;
}

async function query() {
    return await storageService.query(STORAGE_KEY) || [];
}

async function remove(boardId) {
    return await storageService.remove(STORAGE_KEY, boardId)
}

async function save(board) {
    let savedBoard
    if (board._id) {
        const boardToSave = {
            _id: board._id,
            name: board.name,
            color: board.color,
            groups: board.groups,
        }
        savedBoard = await storageService.put(STORAGE_KEY, boardToSave)
    } else {
        const boardToSave = {
            name: board.name,
            color: getRandomColor(),
            groups: board.groups || []
        }
        savedBoard = await storageService.post(STORAGE_KEY, boardToSave)
    }
    return savedBoard
}

async function getById(boardId, filterBy = {}, sortBy = []) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const board = boards.find(board => board._id === boardId) || null;
    if (!board) return null;

    const groups = Array.isArray(board.groups) ? board.groups : [];

    const taskTitleFilter = filterBy.taskTitle && filterBy.taskTitle.trim()
        ? filterBy.taskTitle.toLowerCase()
        : null;

    const textFilter = filterBy.text && filterBy.text.trim().toLowerCase();

    const getStatusIndex = (status) => statusList.findIndex(s => s.value === status);
    const getPriorityIndex = (priority) => priorityList.findIndex(p => p.value === priority);

    const matchesTextDeep = (obj, text) => {
        if (!obj || typeof text !== 'string') return false;

        const searchIn = (val) => {
            if (typeof val === 'string') {
                return val.toLowerCase().includes(text);
            }
            if (Array.isArray(val)) {
                return val.some(searchIn);
            }
            if (typeof val === 'object' && val !== null) {
                return Object.values(val).some(searchIn);
            }
            return false;
        };

        return searchIn(obj);
    };

    const filteredGroups = groups.map(group => {
        const tasks = Array.isArray(group.tasks) ? group.tasks : [];

        const filteredTasks = tasks.filter(task => {
            const priorityMatch = filterBy.Priority?.length
                ? filterBy.Priority.includes(task.priority)
                : true;

            const membersMatch = filterBy.Members?.length
                ? task.members?.some(member => filterBy.Members.includes(member.name))
                : true;

            const statusMatch = filterBy.Status?.length
                ? filterBy.Status.includes(task.status)
                : true;

            const titleMatch = taskTitleFilter
                ? task.taskTitle?.toLowerCase().includes(taskTitleFilter)
                : true;

            const timelineMatch = filterBy.Timeline
                ? task.timeline?.endDate && new Date(task.timeline.endDate) <= new Date(filterBy.Timeline)
                : true;

            const textMatch = textFilter
                ? matchesTextDeep(task, textFilter)
                : true;

            return priorityMatch && membersMatch && statusMatch && titleMatch && timelineMatch && textMatch;
        });

        const sortedTasks = filteredTasks.sort((taskA, taskB) => {
            for (const { title, order } of sortBy) {
                let comparison = 0;
                if (title === 'status') {
                    comparison = getStatusIndex(taskA.status) - getStatusIndex(taskB.status);
                } else if (title === 'priority') {
                    comparison = getPriorityIndex(taskA.priority) - getPriorityIndex(taskB.priority);
                } else if (title === 'name') {
                    comparison = taskA.taskTitle.localeCompare(taskB.taskTitle);
                } else if (title === 'timeline') {
                    const dateA = new Date(taskA.timeline?.endDate || 0);
                    const dateB = new Date(taskB.timeline?.endDate || 0);
                    if (isNaN(dateA) && isNaN(dateB)) {
                        comparison = 0;
                    } else if (isNaN(dateA)) {
                        comparison = 1;
                    } else if (isNaN(dateB)) {
                        comparison = -1;
                    } else {
                        comparison = dateA - dateB;
                    }
                }
                if (comparison !== 0) return comparison * order;
            }
            return 0;
        });

        return {
            ...group,
            tasks: sortedTasks
        };
    });

    return {
        ...board,
        groups: filteredGroups
    };
}



function getBoards() {
    return query()
}

// ----------------- Util -----------------
function getRandomStatus() {
    const randomIndex = Math.floor(Math.random() * statusList.length);
    return statusList[randomIndex].value;
}

function getRandomPriority() {
    const randomIndex = Math.floor(Math.random() * priorityList.length);
    return priorityList[randomIndex].value;
}

function getRandomMembers() {
    const shuffled = allMembers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * allMembers.length) + 1);
}

function getRandomDate() {
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
}

// ----------------- Get Empty + Generate -----------------

function getEmptyBoard() {
    return {
        name: '',
        color: getRandomColor(),
        groups: []
    }
}

function generateBoard() {
    return {
        _id: 'b' + makeId(),
        name: generateBoardName(),
        color: getRandomColor(),
        groups: Array.from({ length: 3 }, () => generateGroup())
    };
}

function getEmptyGroup() {
    return {
        name: '',
        color: getRandomColor(),
        tasks: []
    }
}

function generateGroup() {
    const groupId = 'g' + makeId();
    return {
        _id: groupId,
        name: generateGroupName(),
        color: getRandomColor(),
        tasks: Array.from({ length: 4 }, () => generateTask(groupId))
    };
}

function getEmptyTask(groupId) {
    return {
        taskTitle: '',
        groupId,
        members: [],
        replies: [],
        date: '',
        status: '',
        priority: '',
        timeline: {
            "startDate": "",
            "endDate": ""
        }
    }
}

function generateTask(groupId = '') {
    return {
        _id: 't' + makeId(),
        taskTitle: generateTaskName(),
        groupId,
        members: getRandomMembers(),
        timeline: {
            startDate: '',
            endDate: ''
        },
        date: "",
        status: getRandomStatus(),
        priority: getRandomPriority()
    };
}

async function addBoardMsg(boardId, txt) {
    // Later, this is all done by the backend
    const board = await getById(boardId)

    const msg = {
        _id: makeId(),
        by: userService.getLoggedinUser(),
        txt
    }
    board.msgs.push(msg)
    await storageService.put(STORAGE_KEY, board)

    return msg
}

async function getEmptyFilter() {
    return {
        taskTitle: '',
        status: [],
        priority: [],
        members: [],
        timeline: ''
    }
}

function getDateFilters() {
    const today = new Date();
    // Normalize today to midnight
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Single-day calculations
    const yesterday = new Date(normalizedToday);
    yesterday.setDate(normalizedToday.getDate() - 1);

    const tomorrow = new Date(normalizedToday);
    tomorrow.setDate(normalizedToday.getDate() + 1);

    // Week calculations (assuming week starts on Monday)
    const dayOfWeek = normalizedToday.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // If Sunday (0), treat it as day 7 so that Monday is the start of the week
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    // Calculate Monday of the current week
    const startOfThisWeek = new Date(normalizedToday);
    startOfThisWeek.setDate(normalizedToday.getDate() - (adjustedDay - 1));
    // End of this week is Sunday (i.e., Monday + 6 days)
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);

    // Last week: previous Monday to previous Sunday
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);

    // Next week: next Monday to next Sunday
    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    // Month calculations
    const startOfThisMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 1);
    // Setting date to 0 gives the last day of the previous month, so for current month end:
    const endOfThisMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() + 1, 0);

    // Last month
    const startOfLastMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() - 1, 1);
    const endOfLastMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 0);

    // Next month
    const startOfNextMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() + 1, 1);
    const endOfNextMonth = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() + 2, 0);

    // Past Dates: all dates before today
    // Future Dates: all dates after today
    // Upcoming: define as the next 7 days (from tomorrow to 7 days later)
    const upcomingStart = new Date(tomorrow);
    const upcomingEnd = new Date(tomorrow);
    upcomingEnd.setDate(tomorrow.getDate() + 7 - 1); // upcoming range: 7 days

    return [
        { label: 'Yesterday', value: yesterday },
        { label: 'Today', value: normalizedToday },
        { label: 'Tomorrow', value: tomorrow },
        { label: 'This Week', value: { start: startOfThisWeek, end: endOfThisWeek } },
        { label: 'Last Week', value: { start: startOfLastWeek, end: endOfLastWeek } },
        { label: 'Next Week', value: { start: startOfNextWeek, end: endOfNextWeek } },
        { label: 'This Month', value: { start: startOfThisMonth, end: endOfThisMonth } },
        { label: 'Last Month', value: { start: startOfLastMonth, end: endOfLastMonth } },
        { label: 'Next Month', value: { start: startOfNextMonth, end: endOfNextMonth } },
        { label: 'Past Dates', value: { before: normalizedToday } },
        { label: 'Future Dates', value: { after: normalizedToday } },
        { label: 'Upcoming', value: { start: upcomingStart, end: upcomingEnd } }
    ];
}

function getMemberTaskDistribution(board) {
    // Initialize member count object
    const memberCounts = {};
    let noMembersCount = 0; // Counter for tasks with no members

    // Iterate through all groups and tasks to count members
    board.groups.forEach(group => {
        group.tasks.forEach(task => {
            // Check if task has no members
            if (!task.members || task.members.length === 0) {
                noMembersCount++;
            } else {
                // Count each member in the task
                task.members.forEach(member => {
                    if (!memberCounts[member.name]) {
                        memberCounts[member.name] = {
                            count: 0,
                            color: member.color
                        };
                    }
                    memberCounts[member.name].count++;
                });
            }
        });
    });

    let membersArray = Object.keys(memberCounts)
        .map(name => ({
            name,
            count: memberCounts[name].count,
            color: memberCounts[name].color
        }));

    if (noMembersCount > 0) {
        membersArray.push({
            name: "No members",
            count: noMembersCount,
            color: "#CCCCCC"
        });
    }

    const sortedMembers = membersArray.sort((a, b) => a.count - b.count);

    const actualMembers = sortedMembers.filter(member => member.name !== "No members");
    const memberColors = ["#fb275d", "#2a5699", "#e4901c"];

    actualMembers.forEach((member, index) => {
        member.color = memberColors[index % memberColors.length];
    });

    // Prepare data for Chart.js
    const labels = sortedMembers.map(member => member.name);
    const counts = sortedMembers.map(member => member.count);
    const colors = sortedMembers.map(member =>
        member.name === "No members" ? "#CCCCCC" : member.color
    );

    return {
        labels,
        counts,
        colors
    };
}

const PRIORITY_COLORS = {
    'low': '#579bfc',      // $clr-priority-low
    'medium': '#5559df',   // $clr-priority-medium
    'high': '#401694',     // $clr-priority-high
    'critical': '#333333', // $clr-priority-critical
    'tbd': '#c4c4c4'       // $clr-priority-tbd
};

// Function to extract priority data from board
function getPriorityDataFromBoard(board) {
    if (!board || !board.groups) return { labels: [], counts: [], colors: [] };

    // Count tasks by priority
    const priorityCounts = {};
    priorityList.forEach(priority => priorityCounts[priority.value] = 0);

    board.groups.forEach(group => {
        if (!group.tasks) return;

        group.tasks.forEach(task => {
            if (task.priority && priorityCounts[task.priority] !== undefined) {
                priorityCounts[task.priority]++;
            }
        });
    });

    // Format data for chart
    const chartData = priorityList
        .filter(priority => priorityCounts[priority.value] > 0)
        .map(priority => ({
            label: priority.label,
            count: priorityCounts[priority.value],
            color: PRIORITY_COLORS[priority.value]
        }));

    return {
        labels: chartData.map(item => item.label),
        counts: chartData.map(item => item.count),
        colors: chartData.map(item => item.color)
    };
}

// Add this function to get the configuration for the member chart
function getMemberChartConfig(memberData) {
    return {
        type: 'bar',
        data: {
            labels: memberData.labels,
            datasets: [{
                label: 'Tasks Assigned',
                data: memberData.counts,
                backgroundColor: memberData.colors,
                borderColor: memberData.colors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Tasks: ${context.raw}`;
                        }
                    }
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // Only show integers
                    }
                }
            }
        }
    };
}



// Chart data preparation
export function getChartDataFromBoard(board) {
    if (!board || !board.groups) return { labels: [], counts: [], colors: [] };

    // Count tasks by status
    const statusCounts = {};
    statusList.forEach(status => statusCounts[status.value] = 0);

    board.groups.forEach(group => {
        if (!group.tasks) return;

        group.tasks.forEach(task => {
            if (task.status && statusCounts[task.status] !== undefined) {
                statusCounts[task.status]++;
            }
        });
    });

    // Format data for chart
    const chartData = statusList
        .filter(status => statusCounts[status.value] > 0)
        .map(status => ({
            label: status.label,
            count: statusCounts[status.value],
            color: STATUS_COLORS[status.value]
        }))
        .sort((a, b) => a.count - b.count);

    return {
        labels: chartData.map(item => item.label),
        counts: chartData.map(item => item.count),
        colors: chartData.map(item => item.color)
    };
}

// Chart configuration factory
function getChartConfig(chartData, chartType = 'bar') {
    const { labels, counts, colors } = chartData;
    const maxValue = counts.length ? Math.max(...counts) : 0;

    // Common dataset configuration
    const dataset = {
        data: counts,
        backgroundColor: colors,
        borderWidth: 0
    };

    // Type-specific dataset config
    if (chartType === 'bar') {
        dataset.borderRadius = 4;
        dataset.barPercentage = 0.8;
        dataset.categoryPercentage = 0.7;
    } else if (chartType === 'pie') {
        dataset.borderColor = colors.map(() => '#fff');
        dataset.borderWidth = 2;
        dataset.hoverOffset = 15;
        dataset.circumference = 360;
        dataset.radius = '70%';
    }

    // Common config
    const config = {
        type: chartType,
        data: {
            labels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500 // Faster animations for smoother transitions
            },
            layout: {
                padding: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 10
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: tooltipItems => tooltipItems[0].label,
                        label: context => `Count: ${context.raw}`
                    }
                }
            }
        },
        plugins: []
    };

    // Type-specific config
    if (chartType === 'bar') {
        // Config for bar chart
        config.options.plugins.legend = { display: false };
        config.options.plugins.title = { display: false };

        config.options.scales = {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    drawBorder: false,
                    color: '#f0f0f0'
                },
                ticks: {
                    padding: 10,
                    color: '#777',
                    font: { size: 12 }
                },
                border: { display: false },
                suggestedMax: maxValue * 1.2
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: '#777',
                    padding: 10,
                    font: { size: 12 }
                },
                border: { display: false }
            }
        };

        // Bar chart specific plugin
        config.plugins.push({
            id: 'datalabels',
            afterDatasetsDraw(chart) {
                if (!chart) return;

                const { ctx } = chart;
                const dataset = chart.data.datasets[0];
                const meta = chart.getDatasetMeta(0);

                if (meta.hidden) return;

                const threshold = maxValue * 0.3;

                meta.data.forEach((element, index) => {
                    const value = dataset.data[index];
                    const { x, y, height } = element.getProps(['x', 'y', 'height']);

                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';

                    if (value > threshold) {
                        // For taller bars, show value inside the bar
                        ctx.fillStyle = '#fff';
                        ctx.fillText(value, x, y + height / 2 + 5);
                    } else {
                        // For shorter bars, show value above the bar
                        ctx.fillStyle = '#333';
                        ctx.fillText(value, x, y - 10);
                    }
                });
            }
        });
    } else if (chartType === 'pie') {
        // Config for pie chart
        config.options.plugins.legend = {
            display: true,
            position: 'right',
            labels: {
                padding: 15,
                color: '#555',
                font: { size: 12 },
                usePointStyle: true,
                boxWidth: 10
            }
        };

        // Add specific options for pie charts
        config.options.cutout = '0%';  // Make it a full pie, not a donut
        config.options.radius = '70%'; // Slightly smaller to fit in container

        // Pie chart specific plugin for labels
        config.plugins.push({
            id: 'datalabels',
            afterDatasetsDraw(chart) {
                if (!chart || !chart.data) return;

                const { ctx } = chart;
                ctx.save();

                // Only try to get metadata if chart exists and is rendered
                const meta = chart.getDatasetMeta(0);
                if (!meta || meta.hidden) {
                    ctx.restore();
                    return;
                }

                const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);

                meta.data.forEach((element, index) => {
                    try {
                        // Get position - use center for small segments, tooltipPosition for larger ones
                        const { x, y } = element.tooltipPosition ?
                            element.tooltipPosition() :
                            { x: chart.getDatasetMeta(0).data[index].x, y: chart.getDatasetMeta(0).data[index].y };

                        // Get the data value
                        const value = chart.data.datasets[0].data[index];
                        const percentage = Math.round((value / total) * 100);

                        // Only show labels for segments that are large enough
                        if (percentage >= 8) {
                            // Draw with appropriate contrast
                            ctx.font = 'bold 12px Arial';
                            ctx.fillStyle = 'white';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            // Just draw the text without the stroke/shadow
                            ctx.fillText(value, x, y);
                        }
                    } catch (err) {
                        console.error('Error rendering pie chart label:', err);
                    }
                });

                ctx.restore();
            }
        });
    }

    return config;
}