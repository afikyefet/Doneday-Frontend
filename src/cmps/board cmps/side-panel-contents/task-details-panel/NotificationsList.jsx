import { useSelector } from "react-redux";
import { NotificationsPreview } from "./NotificationsPreview";

export const NotificationsList = () => {
    const notifications = useSelector(storeState => storeState.boardModule.notifications);

    return <section className="notifications-list side-padding">
        {notifications.map(notification => <NotificationsPreview key={notification._id} notification={notification} />)}
    </section>
}