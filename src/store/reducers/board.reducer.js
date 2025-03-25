export const SET_BOARDS = 'SET_BOARDS';
export const SET_BOARD = 'SET_BOARD';
export const REMOVE_BOARD = 'REMOVE_BOARD';
export const ADD_BOARD = 'ADD_BOARD';
export const UPDATE_BOARD = 'UPDATE_BOARD';

export const SET_FILTER = 'SET_FILTER';
export const SET_SORT = 'SET_SORT';

export const SET_CMP_ORDER = 'SET_CMP_ORDER';

export const ADD_MEMBERS = 'ADD_MEMBERS'

export const SET_MEMBERS = 'SET_MEMBERS'

export const SET_GLOBALLY_COLLAPSED = 'SET_GLOBALLY_COLLAPSED';

export const REMOVE_SELECTED_TASK = 'REMOVE_SELECTED_TASK';

export const UPDATE_NOTIFICATIONS = 'UPDATE_NOTIFICATIONS';

export const NOTIFICATION_INDICATOR = 'NOTIFICATION_INDICATOR';




const initialState = {
    boards: [],
    board: null,
    notificationIndicator: false,
    selectedTasks: [],
    lastRemovedBoard: null,
    statusLabels: [],
    priorityLabels: [],
    notifications: [],
    filterBy: {},
    sortBy: [],
    cmpOrder: ["status",
        "priority",
        "members",
        // "date",
        "timeline",
        "link"],
    isGloballyCollapsed: false,
    members: [],
};

export function boardReducer(state = initialState, action) {
    let boards;
    switch (action.type) {
        case NOTIFICATION_INDICATOR:
            return {
                ...state,
                notificationIndicator: action.state
            }
        case SET_BOARDS:
            return {
                ...state,
                boards: action.boards || []
            };

        case SET_BOARD:
            return {
                ...state,
                board: action.board || { groups: [] }
            };

        case UPDATE_BOARD:
            return {
                ...state,
                boards: state.boards.map(board =>
                    board._id === action.board._id ? action.board : board
                ),
                board: { ...action.board }
            };

        case REMOVE_BOARD:
            boards = state.boards.filter(board => board._id !== action.boardId);
            return {
                ...state,
                boards: [...boards],
            };

        case ADD_BOARD:
            return {
                ...state,
                boards: [...state.boards, action.board]
            };

        case SET_CMP_ORDER:
            return {
                ...state,
                cmpOrder: { ...action.cmpOrder }
            };

        case SET_GLOBALLY_COLLAPSED:
            return {
                ...state,
                isGloballyCollapsed: action.isGloballyCollapsed
            };

        case UPDATE_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.notifications
            }

        case ADD_MEMBERS: {
            const groupId = action.groupId;
            const members = action.members;

            return {
                ...state,
                board: {
                    ...state.board,
                    groups: (state.board.groups || []).map(group =>
                        group._id === groupId
                            ? {
                                ...group,
                                tasks: (group.tasks || []).map(task => ({
                                    ...task,
                                    members: [...(task.members || []), ...members]
                                }))
                            }
                            : group
                    )
                }
            };
        }

        case SET_MEMBERS:
            return {
                ...state,
                members: action.members
            }

        case REMOVE_SELECTED_TASK:
            return {
                ...state,
                selectedTasks: state.selectedTasks.filter(task => task._id !== action.taskId)
            }

        case SET_FILTER:
            return {
                ...state,
                filterBy: { ...state.filterBy, ...action.filterBy }
            };
        case SET_SORT:
            return {
                ...state,
                sortBy: [...action.sortBy]
            };

        default:
            return state;
    }
}