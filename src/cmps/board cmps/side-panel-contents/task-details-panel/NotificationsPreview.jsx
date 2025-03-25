import { Avatar, Text } from "@vibe/core"
import moment from "moment"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router"
import { DynamicDesc } from "./DynamicDesc"

export const NotificationsPreview = ({ notification }) => {
    const user = notification.by
    const boardId = useSelector(storeState => storeState.boardModule.board._id);
    const navigate = useNavigate();

    function navigateToTask() {
        navigate(`/board/${boardId}/task/${notification.task._id}`)
    }

    return <section className="notification-preview elipsis" onClick={navigateToTask}>
        {user.avatar && <Avatar src={user.avatar} size="medium" type="img" ariaLabel={user.name} />}
        {!user.avatar && <Avatar text={user.name.substring(0, 1)} backgroundColor="blackish" size="medium" ariaLabel={user.name} />}
        <div className="notification-preview-content">
            <div className="notification-preview-name-time">
                <div className="name-desc">
                    <Text type="text2" className="notification-preview-name">{user.name}</Text>
                    <DynamicDesc type={notification.type} />
                    <span>on a task.</span>
                </div>
                <Text type="text2" className="notification-preview-time">
                    {moment(notification.at).fromNow()}
                    {!notification.read && <div className="unread-notification"></div>}
                </Text>
            </div>
            <div className="notification-preview-text elipsis">
                <Text type="text2" ellipsis>{notification.text}</Text>
            </div>
            <div className="notification-preview-title elipsis">
                <Text type="text2" color="secondary" className="elipsis">{notification.task.taskTitle}</Text>
            </div>
        </div>
    </section>
}