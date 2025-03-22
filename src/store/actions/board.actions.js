
import { boardService } from '../../services/board';
import { userService } from '../../services/user';

import { REMOVE_BOARD, SET_BOARD, SET_BOARDS, SET_CMP_ORDER, SET_FILTER, SET_MEMBERS, SET_SORT } from '../reducers/board.reducer';
import { store } from '../store';

export async function loadMembers() {
    const users = await userService.getUsers();
    store.dispatch(getCmdSetMembers(users));
}

// Get Boards
export async function loadBoards() {
    try {
        const boards = await boardService.query();
        store.dispatch(getCmdSetBoards(boards));
        return boards;
    } catch (err) {
        console.error('Board Action -> Cannot load boards', err);
        throw err;
    }
}

// Save boards
export async function setBoards(boards) {
    try {
        store.dispatch(getCmdSetBoards(boards));
        const savedBoards = await Promise.all(
            boards.map(board => boardService.save(board))
        );
        // store.dispatch(getCmdSetBoards(savedBoards));
        return savedBoards;
    } catch (error) {
        console.error('Failed to save boards:', error);
        throw error;
    }
}

// Get Board
export async function getById(boardId, filterBy = {}, sortBy = []) {
    try {
        const board = await boardService.getById(boardId, filterBy, sortBy);
        if (!board) throw new Error('Board not found');
        return board;
    } catch (err) {
        console.error('Board Action -> Cannot get board', err);
        throw err;
    }
}

// Set Board
export async function setBoard(board) {
    store.dispatch(getCmdSetBoard(board));
}

// Remove Board
export async function removeBoard(boardId) {
    try {
        await boardService.remove(boardId);
        store.dispatch(getCmdRemoveBoard(boardId))
    } catch (err) {
        console.error('Board Action -> Cannot remove board', err);
        throw err;
    }
}

// Add Board
export async function addBoard(board) {
    try {
        const savedBoard = await boardService.save(board);
        store.dispatch(getCmdSetBoard(savedBoard));
        const boards = await boardService.query()
        store.dispatch(getCmdSetBoards(boards));
        return savedBoard;
    } catch (err) {
        console.error('Board Action -> Cannot add board', err);
        throw err;
    }
}

// Update Board
export async function updateBoard(board) {
    try {
        store.dispatch(getCmdSetBoard(board));
        const savedBoard = await boardService.save(board);
        store.dispatch(getCmdSetBoard(savedBoard));
    } catch (err) {
        console.error('Board Action -> Cannot save board', err)
        throw err
    }
}

// Update Board Without setting it a current board
export async function updateBoardOnBackground(board) {
    try {
        await boardService.save(board);
    } catch (err) {
        console.error('Board Action -> Cannot save board', err)
        throw err
    }
}

// Set Component Order (optional action)
export function setCmpOrder(cmpOrder) {
    return store.dispatch(getCmdCmpOrder(cmpOrder));
}

// Set Filter
export function setFilterBy(filterBy) {
    return store.dispatch(getCmdFilterBy(filterBy));
}
// Set Sort
export function setSortBy(sortBy) {
    return store.dispatch(getCmdSortBy(sortBy));
}

// Command Creators:
// Board Commands
function getCmdSetBoards(boards) {
    return { type: SET_BOARDS, boards };
}
export function getCmdSetBoard(board) {
    return { type: SET_BOARD, board };
}

function getCmdRemoveBoard(boardId) {
    return { type: REMOVE_BOARD, boardId }
}

// Component Order Command
function getCmdCmpOrder(cmpOrder) {
    return { type: SET_CMP_ORDER, cmpOrder };
}

// Filter By Command
function getCmdFilterBy(filterBy) {
    return { type: SET_FILTER, filterBy };
}
function getCmdSortBy(sortBy) {
    return { type: SET_SORT, sortBy };
}

function getCmdSetMembers(members) {
    return { type: SET_MEMBERS, members };
}