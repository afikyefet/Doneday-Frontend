import { Date } from "../dynamicCmps/Date";
import { LinkColumn } from "../dynamicCmps/Link";
import { Member } from "../dynamicCmps/Member";
import { Priority } from "../dynamicCmps/Priority";
import { Status } from "../dynamicCmps/Status";
import { Timeline } from "../dynamicCmps/Timeline";

const DynamicColumn = ({ cmpType, info, onTaskUpdate }) => {
    switch (cmpType) {
        case "priority":
            return <Priority info={info} onTaskUpdate={onTaskUpdate} />;
        case "status":
            return <Status info={info} onTaskUpdate={onTaskUpdate} />;
        case "members":
            return <Member info={info} onTaskUpdate={onTaskUpdate} />;
        case "date":
            return <Date info={info} onTaskUpdate={onTaskUpdate} />;
        case "timeline":
            return <Timeline info={info} onTaskUpdate={onTaskUpdate} />;
        case "link":
            return <LinkColumn info={info} onTaskUpdate={onTaskUpdate} />;
        default:
            return null;
    }
}

export default DynamicColumn