
import { store } from '../../store/store';
import { socketService } from '../socket.service';
import { boardService as local } from './board.service.local';
import { boardService as remote } from './board.service.remote';

export { priorityList, statusList } from './board-values';

async function emitNotification(notification) {
    const board = store.getState().boardModule.board
    const boardId = board?._id

    notification.boardId = boardId;
    notification.at = Date.now();

    socketService.emit('trigger-notification', notification);
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

const service = import.meta.env.VITE_LOCAL === 'true' ? local : remote;
export const boardService = { ...service, emitNotification, getEmptyReply }

// Easy access to this service from the dev tools console
// when using script - dev / dev:local

if (DEV) window.boardService = boardService