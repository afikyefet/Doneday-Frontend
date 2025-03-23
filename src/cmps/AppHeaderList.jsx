import { Avatar, Badge } from "@vibe/core";
import { Invite, Notifications } from "@vibe/icons";
import { useSelector } from "react-redux";
import { userService } from "../services/user";

const AppHeaderList = ({ onToggleInvite, onOpenNotifications }) => {
    const user = userService.getLoggedinUser();
    const notificationIndicator = useSelector(storeState => storeState.boardModule.notificationIndicator);

    return <section className='app-header-list'>
        <ul>
            <li>
                <button onClick={onOpenNotifications}>
                    {notificationIndicator && <Badge alignment='circular' color='notification' type='indicator' size="small">
                        <Notifications />
                    </Badge>}
                    {!notificationIndicator && <Notifications />}
                </button>
            </li>
            <li>
                <button onClick={onToggleInvite}><Invite /></button>
            </li>
            <li><div className='app-header-logo-divider'></div></li>
            <li className='app-header-user-info'>
                <span className='icon'>
                    <img src="/img/logo-transparent square.png" alt="Doneday logo" className='company-logo' />
                </span>
                <span className='abbv'>
                    {user.imgUrl && <Avatar
                        withoutBorder
                        size="medium"
                        type="img"
                        src={user.imgUrl}
                        ariaLabel={user?.fullname}
                    />}
                    {!user.imgUrl && <Avatar
                        withoutBorder
                        size="medium"
                        type="text"
                        text={user.fullname[0]?.toUpperCase()}
                        backgroundColor="purple"
                        ariaLabel={user.fullname[0]?.toUpperCase()}
                    />}

                </span>
            </li>
        </ul>
    </section>
}

export default AppHeaderList;