
import { storageService } from '../async-storage.service';
import { generateBoardName, generateGroupName, generateTaskName, getRandomColor, makeId } from '../util.service';



const STORAGE_KEY = 'boardDB'

export const boardService = {
    // CRUD Operations for Boards
    query,
    save,
    remove,
    getBoards,
    saveBoard,
    removeBoard,
    getBoardById,
    // CRUD Operations for Groups
    getGroupById,
    saveGroup,
    removeGroup,
    // CRUD Operations for Tasks
    getTaskById,
    saveTask,
    removeTask,
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
    getEmptyReply,
    // Message Operations
    addBoardMsg,
    // Filter
    getEmptyFilter,
    getDateFilters,
    // Storage Key
    STORAGE_KEY
};
export const allMembers = [
    { name: "Dor", label: "Dor", value: "Dor", color: "#2a5699" },
    { name: "Ariel", label: "Ariel", value: "Ariel", color: "#e4901c" },
    { name: "Afik", label: "Afik", value: "Afik", color: "#fb275d" }
]

export const statusList = [
    { value: 'done', label: 'Done', className: 'status-done' },
    { value: 'wip', label: 'Working on it', className: 'status-wip' },
    { value: 'stuck', label: 'Stuck', className: 'status-stuck' },
    { value: 'onhold', label: 'On Hold', className: 'status-onhold' },
    { value: 'revision', label: 'Requires Revision', className: 'status-revision' },
    { value: 'design', label: 'In Design', className: 'status-design' },
    { value: 'draft', label: 'Draft', className: 'status-draft' },
]

export const priorityList = [
    { value: 'low', label: 'Low', className: 'priority-low' },
    { value: 'medium', label: 'Medium', className: 'priority-medium' },
    { value: 'high', label: 'High', className: 'priority-high' },
    { value: 'critical', label: 'Critical⚠️', className: 'priority-critical' },
    { value: 'tbd', label: 'TBD', className: 'priority-tbd' },
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

async function query(filterBy = { name: '' }) {
    var boards = await storageService.query(STORAGE_KEY) || [];

    const { name } = filterBy;

    if (name) {
        return boards.filter(board => name.toLowerCase().includes(board.name.toLowerCase()))
    }

    return boards
}

async function remove(boardId) {
    await storageService.remove(STORAGE_KEY, boardId)
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
        }
        savedBoard = await storageService.post(STORAGE_KEY, boardToSave)
    }
    return savedBoard
}
function getBoards(filterBy = {}) {
    return query()
}

// ----------------- Boards -----------------
async function getBoardById(boardId, filterBy = {}, sortBy = []) {

    let boards = await storageService.query(STORAGE_KEY) || [];
    const board = boards.find(board => board._id === boardId) || null;
    if (!board) return null;

    const groups = Array.isArray(board.groups) ? board.groups : [];

    const taskTitleFilter = filterBy.taskTitle && filterBy.taskTitle.trim()
        ? filterBy.taskTitle.toLowerCase()
        : null;

    const getStatusIndex = (status) => statusList.findIndex(s => s.value === status);
    const getPriorityIndex = (priority) => priorityList.findIndex(p => p.value === priority);

    const filteredGroups = groups.map(group => {
        const tasks = Array.isArray(group.tasks) ? group.tasks : [];
        const filteredTasks = tasks.filter(task => {
            const priorityMatch = filterBy.Priority && filterBy.Priority.length > 0
                ? filterBy.Priority.includes(task.priority)
                : true;

            const membersMatch = filterBy.Members && filterBy.Members.length > 0
                ? task.members && task.members.some(member => filterBy.Members.includes(member.name))
                : true;

            const statusMatch = filterBy.Status && filterBy.Status.length > 0
                ? filterBy.Status.includes(task.status)
                : true;

            const titleMatch = taskTitleFilter
                ? task.taskTitle && task.taskTitle.toLowerCase().includes(taskTitleFilter)
                : true;

            const timelineMatch = filterBy.Timeline
                ? task.timeline?.endDate && new Date(task.timeline.endDate) <= new Date(filterBy.Timeline)
                : true;

            return priorityMatch && membersMatch && statusMatch && titleMatch && timelineMatch;
        });

        const sortedTasks = filteredTasks.sort((taskA, taskB) => {
            for (const { title, order } of sortBy) {
                let comparison = 0;
                if (title === 'status') {
                    comparison = getStatusIndex(taskA.status) - getStatusIndex(taskB.status);
                } else if (title === 'priority') {
                    comparison = getPriorityIndex(taskA.priority) - getPriorityIndex(taskB.priority);
                } else if (title === 'name') {
                    comparison = taskA.taskTitle.localeCompare(taskB.taskTitle)
                } else if (title === 'timeline') {
                    const dateA = new Date(taskA.timeline?.endDate || 0)
                    const dateB = new Date(taskB.timeline?.endDate || 0)
                    if (isNaN(dateA) && isNaN(dateB)) {
                        comparison = 0
                    } else if (isNaN(dateA)) {
                        comparison = 1
                    } else if (isNaN(dateB)) {
                        comparison = -1
                    } else {
                        comparison = dateA - dateB
                    }
                }
                if (comparison !== 0) return comparison * order;
            }
            return 0
        }
        )
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



async function saveBoard(newBoard) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const boardIdx = boards.findIndex(board => board._id === newBoard._id)
    if (boardIdx === -1) {
        const emptyBoard = getEmptyBoard();
        newBoard._id = 'b' + makeId();
        newBoard = { ...emptyBoard, ...newBoard }
        console.log(newBoard);
        boards.push(newBoard)
    } else {
        boards[boardIdx] = newBoard
    }
    await storageService._save(STORAGE_KEY, boards);
    return newBoard;
}

async function removeBoard(boardId) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    boards = boards.filter(board => board._id !== boardId);

    await storageService._save(STORAGE_KEY, boards);
    return boardId;
}

// ----------------- Groups -----------------
async function getGroupById(groupId) {
    const boards = await boardService.getBoards();
    if (!boards || boards.length === 0) {
        throw new Error('No boards found.');
    }
    for (const board of boards) {
        if (board.groups && board.groups.length) {
            const group = board.groups.find(g => g._id === groupId);
            if (group) return group;
        }
    }
    throw new Error(`Group with ID ${groupId} not found in any board.`);
}

async function saveGroup(boardId, newGroup) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const boardIdx = boards.findIndex(board => board._id === boardId);

    if (boardIdx === -1) throw new Error(`Board with ID ${boardId} not found`);

    const groupIdx = boards[boardIdx].groups.findIndex(group => group._id === newGroup._id)

    if (groupIdx === -1) {
        newGroup._id = 'g' + makeId();
        boards[boardIdx].groups.push(newGroup)
    } else {
        boards[boardIdx].groups[groupIdx] = newGroup
    }

    await storageService._save(STORAGE_KEY, boards)
    return newGroup;
}

async function removeGroup(boardId, groupId) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const boardIdx = boards.findIndex(board => board._id === boardId);

    if (boardIdx === -1) throw new Error(`Board with ID ${boardId} not found`);

    boards[boardIdx].groups = boards[boardIdx].groups.filter(group => group._id !== groupId);

    await storageService._save(STORAGE_KEY, boards);
    return groupId;
}

// ----------------- Tasks -----------------
async function getTaskById(taskId) {
    const boards = await boardService.getBoards();
    if (!boards || boards.length === 0) {
        throw new Error('No boards found.');
    }
    for (const board of boards) {
        if (board.groups && board.groups.length) {
            for (const group of board.groups) {
                if (group.tasks && group.tasks.length) {
                    const task = group.tasks.find(t => t._id === taskId);
                    console.log(task);

                    if (task) return task;
                }
            }
        }
    }
    throw new Error(`Task with ID ${taskId} not found in any board.`);
}

async function saveTask(boardId, groupId, newTask) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const boardIdx = boards.findIndex(board => board._id === boardId);

    if (boardIdx === -1) throw new Error(`Board with ID ${boardId} not found`);

    const groupIdx = boards[boardIdx].groups.findIndex(group => group._id === groupId);

    if (groupIdx === -1) throw new Error(`Group with ID ${groupId} not found`);

    if (!boards[boardIdx].groups[groupIdx].tasks) {
        boards[boardIdx].groups[groupIdx].tasks = [];
    }

    if (!newTask.groupId) newTask.groupId = groupId;

    const taskIdx = boards[boardIdx].groups[groupIdx].tasks.findIndex(task => task._id === newTask._id);

    if (taskIdx === -1) {
        newTask.allMembers = allMembers;
        newTask._id = 't' + makeId();
        newTask.priority = 'tbd'
        newTask.status = 'draft'
        boards[boardIdx].groups[groupIdx].tasks.push(newTask);
        await storageService._save(STORAGE_KEY, boards);
        return { ...newTask };
    } else {
        boards[boardIdx].groups[groupIdx].tasks[taskIdx] = newTask;
        await storageService._save(STORAGE_KEY, boards);
        return { ...newTask }
    }

}


async function removeTask(boardId, groupId, taskId) {
    let boards = await storageService.query(STORAGE_KEY) || [];
    const boardIdx = boards.findIndex(board => board._id === boardId);

    if (boardIdx === -1) throw new Error(`Board with ID ${boardId} not found`);

    const groupIdx = boards[boardIdx].groups.findIndex(group => group._id === groupId);

    if (groupIdx === -1) throw new Error(`Group with ID ${groupId} not found`);

    boards[boardIdx].groups[groupIdx].tasks = boards[boardIdx].groups[groupIdx].tasks.filter(task => task._id !== taskId);

    await storageService._save(STORAGE_KEY, boards);
    return taskId;
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

function getEmptyGroup(boardId) {
    return {
        name: '',
        color: getRandomColor(),
        boardId,
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
        allMembers: allMembers,
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
        allMembers: allMembers,
        timeline: {
            startDate: '',
            endDate: ''
        },
        date: "",
        status: getRandomStatus(),
        priority: getRandomPriority()
    };
}

function getEmptyReply() {
    return ({
        _id: crypto.randomUUID(),
        text: '',
        by: {
            _id: 'user101',
            name: 'User 101',
            avatar: ''
        },
        likedBy: []
    })
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
