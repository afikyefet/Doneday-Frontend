import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { values as statusValues } from "../Status";
import ColorBox from "./ColorBox";

const StatusSummary = ({ group }) => {
    const board = useSelector(state => state.boardModule.board);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        if (!group?.tasks?.length) {
            // console.warn("Group tasks are undefined or empty");
            setStatuses([]);
            return;
        }
        const statusesCountObj = group.tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, [])

        const availableStatuses = Object.keys(statusesCountObj);

        const statusesCalc = availableStatuses.map(status => {
            return ({
                status,
                count: statusesCountObj[status],
                percent: parseFloat((statusesCountObj[status] / group.tasks.length * 100).toFixed(2))
            })
        })
        setStatuses(statusesCalc)
    }, [group.tasks, board])

    function getTooltip(status) {
        const label = statusValues.find(v => v.value === status.status)?.label || status.status
        return `${label} ${status.count}/${group.tasks.length} ${status.percent}%`
    }

    return <div className="status-summary summary-cell column-label-status">
        <div className="visual-summary-container">
            {statuses.length === 0 && <ColorBox className={`status-draft`} width={100} />}
            {statuses.length > 0 && statuses.map(status => <ColorBox tooltip={getTooltip(status)} className={`status-${status.status}`} width={status.percent} key={status.status} />)}
        </div>
    </div>
}

export default StatusSummary