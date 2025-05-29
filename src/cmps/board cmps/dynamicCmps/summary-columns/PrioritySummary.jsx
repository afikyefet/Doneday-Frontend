import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { values as priorityValues } from "../Priority";
import ColorBox from "./ColorBox";

const PrioritySummary = ({ group }) => {
    const [priorities, setPriorities] = useState([]);
    const board = useSelector(state => state.boardModule.board)

    useEffect(() => {
        if (!group?.tasks?.length) {
            // console.warn("Group tasks are undefined or empty");
            setPriorities([]);
            return;
        }
        const prioritiesCountObj = group.tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {})

        const availablePriorities = Object.keys(prioritiesCountObj);

        const prioritiesCalc = availablePriorities.map(priority => {
            return ({
                priority,
                count: prioritiesCountObj[priority],
                percent: parseFloat((prioritiesCountObj[priority] / group.tasks.length * 100).toFixed(2))
            })
        })
        setPriorities(prioritiesCalc)
    }, [group.tasks, board])

    function getTooltip(priority) {
        const label = priorityValues.find(v => v.value === priority.priority)?.label || priority.status
        return `${label} ${priority.count}/${group.tasks.length} ${priority.percent}%`
    }

    return <div className="priority-summary summary-cell column-label-priority">
        <div className="visual-summary-container">
            {priorities.length === 0 && <ColorBox className={`priority-tbd`} width={100} />}
            {priorities.length > 0 && priorities.map(priority => <ColorBox tooltip={getTooltip(priority)} className={`priority-${priority.priority}`} width={priority.percent} key={priority.priority} />)}
        </div>
    </div>
}

export default PrioritySummary