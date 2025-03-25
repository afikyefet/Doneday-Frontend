
import "@vibe/core/tokens"
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router'
import { AppHeader } from './cmps/AppHeader'
import ExternalHomePage from "./pages/ExternalHomePage"
import { HomePage } from './pages/HomePage'

import { useEffect } from "react"
import { AppFooter } from './cmps/AppFooter'
import { AppNav } from "./cmps/AppSideNav/AppNav.jsx"
import SlidePanel from "./cmps/SlidePanel"
import { Board } from './pages/Board'
import { Chart } from "./pages/Chart.jsx"
import { socketService } from "./services/socket.service.js"
import { userService } from "./services/user"
import { addNewNotification, getCmdSetBoard, loadBoards, loadMembers, loadNotifications, updateBoardRemoved } from "./store/actions/board.actions.js"
import { store } from "./store/store.js"

export function RootCmp() {
    const isAuthenticated = !!userService.getLoggedinUser();
    if (isAuthenticated) return <AuthenticatedRoutes />
    else return <UnauthenticatedRoutes />
}

const AuthenticatedRoutes = () => {
    const { pathname } = useLocation()
    const match = matchPath('/board/:boardId/task/:taskId', pathname)
    const params = match?.params || {};

    useEffect(() => {
        loadBoards();
        loadMembers();
        loadNotifications();

        socketService.on('updated-board', boardUpdate);
        socketService.on('deleted-board', boardDeleted);
        socketService.on('new-notification', onNotification);

        return () => {
            socketService.off('updated-board', boardUpdate);
            socketService.off('deleted-board', boardDeleted)
            socketService.off('new-notification', onNotification);
        }
    }, [])

    function boardUpdate(board) {
        store.dispatch(getCmdSetBoard(board));
    }

    function boardDeleted(boardId) {
        updateBoardRemoved(boardId);
    }

    function onNotification(notification) {
        addNewNotification(notification);
    }

    return <div className="main-container">
        <AppHeader />
        <AppNav />
        <SlidePanel params={params} />
        <main className={`page-container ${location.pathname.includes('/chart') ? 'chart-page' : ''}`}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path='/board/:boardId' element={<Board />}>
                    <Route path="task/:taskId" element={<></>} />
                </Route>
                <Route path="/board/:boardId/chart" element={<Chart />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
        <AppFooter />
    </div >
}

const UnauthenticatedRoutes = () => {
    return <div className="external-main-container">
        <Routes>
            <Route path="/" element={<ExternalHomePage />} />
            <Route path='*' element={<Navigate to="/" replace />} />
            <Route path='' element={<Navigate to="/" replace />} />
        </Routes>
    </div>
}


