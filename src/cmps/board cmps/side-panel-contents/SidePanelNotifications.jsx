import { useEffect } from "react"
import { readNotifications } from "../../../store/actions/board.actions"
import SidePanelWrapper from "./SidePanelWrapper"
import { NotificationsList } from "./task-details-panel/NotificationsList"

const SidePanelNotifications = () => {
    useEffect(() => {
        return () => readNotifications()
    }, [])

    return <SidePanelWrapper heading="Notifications">
        <NotificationsList />
    </SidePanelWrapper>
}

export default SidePanelNotifications