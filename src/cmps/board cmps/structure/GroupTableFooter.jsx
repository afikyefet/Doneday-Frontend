import { EditableText } from "@vibe/core"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { boardService } from "../../../services/board/board.service.local"
import { cn, makeId } from "../../../services/util.service"
import { updateBoard } from "../../../store/actions/board.actions"
import GroupColumnFiller from "./GroupColumnFillter"
import GroupPreRow from "./GroupPreRow"
import GroupStickyColumns from "./GroupStickyColumns"

const GroupTableFooter = ({ group }) => {

    const [taskValue, setTaskValue] = useState("")
    const board = useSelector(storeState => storeState.boardModule.board)

    useEffect(() => {
        if (!taskValue) return;
        onAddTask(taskValue)
        setTaskValue("")
    }, [taskValue])


    async function onAddTask(taskTitle) {
        try {
            const groupId = group._id

            let newTask = boardService.getEmptyTask()
            newTask._id = 't' + makeId();
            newTask.priority = 'tbd'
            newTask.status = 'draft'
            newTask = { ...newTask, groupId, taskTitle }

            const groupIdx = board.groups.findIndex(group => group._id === groupId);
            const newBoard = { ...board }

            if (!newBoard.groups[groupIdx].tasks) {
                newBoard.groups[groupIdx].tasks = [];
            }

            newBoard.groups[groupIdx].tasks.push(newTask)

            await updateBoard(newBoard)
        } catch (error) {
            console.log('Could not add task', error);

        }
    }


    return <section className="table-footer">
        <GroupStickyColumns>
            <GroupPreRow crudlType="none" group={group} roundedBottomLeft bottomBorders disableCheckbox ligherColor />
            <div className="min-table-cell add-task-cell table-cell-first-column task-title default-cell-color bottom-border" style={{ textAlign: 'left' }}>
                <EditableText
                    value={taskValue}
                    onChange={setTaskValue}
                    className="cell-left-padding"
                    placeholder="+ Add task"
                />
            </div>
        </GroupStickyColumns>
        <GroupColumnFiller borders />
    </section >
}

export default GroupTableFooter