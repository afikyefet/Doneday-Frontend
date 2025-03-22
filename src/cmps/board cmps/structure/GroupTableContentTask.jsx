// GroupTableContentTask.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditableText } from "@vibe/core";
import { useSelector } from "react-redux";
import { userService } from "../../../services/user";
import { makeId } from "../../../services/util.service";
import { updateBoard } from "../../../store/actions/board.actions";
import { addSelectedTask, removeSelectedTask } from "../../../store/actions/taskSelect.actions";
import DynamicColumn from "./DynamicColumn";
import GroupPreRow from "./GroupPreRow";
import GroupScrollableColumns from "./GroupScrollableColumns";
import GroupStickyColumns from "./GroupStickyColumns";
import TaskDetailsTriggerCell from "./TaskDetailsTriggerCell";

const GroupTableContentTask = React.memo(({ task, group }) => {
    const selectedTasks = useSelector(storeState => storeState.taskSelectModule.selectedTasks);
    const cmpOrder = useSelector(state => state.boardModule.cmpOrder);
    const board = useSelector(state => state.boardModule.board);
    const members = useSelector(state => state.boardModule.members);

    // The setNodeRef and style must remain on the root container.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id, data: { type: 'task' } });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30000 : 0,
    };

    const handleCellUpdate = async (cmpType, value) => {
        try {
            const newBoard = { ...board };
            const groupIdx = newBoard.groups.findIndex(g => g._id === group._id);
            if (groupIdx === -1) throw new Error(`Group with id ${group._id} not found`);

            const taskIdx = newBoard.groups[groupIdx].tasks.findIndex(t => t._id === task._id);
            if (taskIdx === -1) throw new Error(`Task with id ${task._id} not found`);

            const foundTask = newBoard.groups[groupIdx].tasks[taskIdx]

            const previousValue = structuredClone(foundTask[cmpType]);
            foundTask[cmpType] = value;
            // console.log("🚀 ~ handleCellUpdate ~ foundTask[cmpType]:", foundTask[cmpType])

            const loggedUser = userService.getLoggedinUser();

            const user = {
                _id: loggedUser._id,
                name: loggedUser.fullname,
                avatar: loggedUser.imgUrl
            };

            const newActivity = {
                _id: makeId(),
                user: user,
                previous: previousValue,
                current: value,
                cmpType: cmpType,
                at: Date.now()
            }

            const activities = [newActivity, ...(Array.isArray(foundTask.activities) ? foundTask.activities : [])];
            foundTask.activities = activities;

            await updateBoard(newBoard);
        } catch (error) {
            console.error("Error updating task cell:", error);
        }
    };

    async function handleChangeSelect(ev, groupId, taskId) {
        if (ev.target.checked) {
            await addSelectedTask(groupId, taskId);
        } else {
            await removeSelectedTask(groupId, taskId);
        }
    }

    const handleChangeTitle = async (taskTitle) => {
        try {
            const newBoard = { ...board };
            const groupIdx = newBoard.groups.findIndex(g => g._id === group._id);
            if (groupIdx === -1) throw new Error(`Group with id ${group._id} not found`);

            const taskIdx = newBoard.groups[groupIdx].tasks.findIndex(t => t._id === task._id);
            if (taskIdx === -1) throw new Error(`Task with id ${task._id} not found`);

            const foundTask = newBoard.groups[groupIdx].tasks[taskIdx]
            const previousValue = structuredClone(foundTask.taskTitle);
            foundTask.taskTitle = taskTitle;

            const user = userService.getLoggedinUser();

            const newActivity = {
                _id: makeId(),
                user: {
                    _id: user._id,
                    name: user.fullname,
                    avatar: user.imgUrl
                },
                previous: previousValue,
                current: taskTitle,
                cmpType: 'taskTitle',
                at: Date.now()
            }

            const activities = [newActivity, ...(Array.isArray(foundTask.activities) ? foundTask.activities : [])];
            foundTask.activities = activities;

            await updateBoard(newBoard);
        } catch (error) {
            console.error("Error updating task title:", error);
        }
    };

    function isTaskSelected(groupId = "", taskId = "") {
        const groupSelected = selectedTasks.find(selectedGroups => selectedGroups.groupId === groupId);
        if (!groupSelected) return false;
        return groupSelected.tasks.includes(taskId);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="listitem"
            className="table-task-row"
            type='task'
        >
            <GroupStickyColumns>
                <GroupPreRow
                    crudlType="task"
                    isChecked={isTaskSelected(group._id, task._id)}
                    onCheckBox={(ev) => handleChangeSelect(ev, group._id, task._id)}
                    group={group}
                    task={task}
                />
                <div className="min-table-cell table-cell-first-column task-title default-cell-color"
                    {...attributes}
                    {...listeners}>
                    <div
                        className="task-title-container"
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                    >
                        <EditableText
                            className="task-title-display"
                            type="text2"
                            onChange={handleChangeTitle}
                            value={task.taskTitle}
                        />
                    </div>
                    <TaskDetailsTriggerCell task={task} />
                </div>
            </GroupStickyColumns >
            <GroupScrollableColumns>
                {cmpOrder.map(cmpType =>
                    <DynamicColumn
                        key={cmpType}
                        cmpType={cmpType}
                        info={task[cmpType]}
                        onTaskUpdate={(value) => handleCellUpdate(cmpType, value)}
                    />
                )}
            </GroupScrollableColumns>
        </div >
    );
});

export default GroupTableContentTask;
