// GroupTableContentTask.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditableText } from "@vibe/core";
import React, { useCallback } from "react";
import { addSelectedTask, removeSelectedTask } from "../../../store/actions/taskSelect.actions";
import DynamicColumn from "./DynamicColumn";
import GroupPreRow from "./GroupPreRow";
import GroupScrollableColumns from "./GroupScrollableColumns";
import GroupStickyColumns from "./GroupStickyColumns";
import TaskDetailsTriggerCell from "./TaskDetailsTriggerCell";
import { userService } from "../../../services/user";
import { makeId } from "../../../services/util.service";

const GroupTableContentTask = ({ task, group, onUpdateTask, selectedTasks, cmpOrder }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task._id,
        data: { type: 'task' }
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30000 : 0,
        opacity: isDragging ? 0 : 1
    };

    console.log("GroupTableContentTask rendered for task", task._id);

    // Handler to update a specific cell (attribute) of the task.
    const handleCellUpdate = useCallback(async (cmpType, value) => {
        try {
            const updatedTask = { ...task };
            const previousValue = structuredClone(updatedTask[cmpType]);
            updatedTask[cmpType] = value;

            const loggedUser = userService.getLoggedinUser();
            const user = {
                _id: loggedUser._id,
                name: loggedUser.fullname,
                avatar: loggedUser.imgUrl
            };

            const newActivity = {
                _id: makeId(),
                user,
                previous: previousValue,
                current: value,
                cmpType,
                at: Date.now()
            };

            updatedTask.activities = [newActivity, ...(Array.isArray(updatedTask.activities) ? updatedTask.activities : [])];

            await onUpdateTask(updatedTask);
        } catch (error) {
            console.error("Error updating task cell:", error);
        }
    }, [task, onUpdateTask]);

    const handleChangeSelect = useCallback(async (ev) => {
        if (ev.target.checked) {
            await addSelectedTask(group._id, task._id);
        } else {
            await removeSelectedTask(group._id, task._id);
        }
    }, [group._id, task._id]);

    const handleChangeTitle = useCallback(async (newTitle) => {
        try {
            const updatedTask = { ...task };
            const previousValue = structuredClone(updatedTask.taskTitle);
            updatedTask.taskTitle = newTitle;

            const user = userService.getLoggedinUser();
            updatedTask.activities = [
                {
                    _id: makeId(),
                    user: {
                        _id: user._id,
                        name: user.fullname,
                        avatar: user.imgUrl
                    },
                    previous: previousValue,
                    current: newTitle,
                    cmpType: 'taskTitle',
                    at: Date.now()
                },
                ...(Array.isArray(updatedTask.activities) ? updatedTask.activities : [])
            ];

            await onUpdateTask(updatedTask);
        } catch (error) {
            console.error("Error updating task title:", error);
        }
    }, [task, onUpdateTask]);

    const isTaskSelected = useCallback(
        (groupId, taskId) => {
            const groupSelected = selectedTasks.find(selected => selected.groupId === groupId);
            return groupSelected ? groupSelected.tasks.includes(taskId) : false;
        },
        [selectedTasks]
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="listitem"
            className="table-task-row"
            type="task"
        >
            <GroupStickyColumns>
                <GroupPreRow
                    crudlType="task"
                    isChecked={isTaskSelected(group._id, task._id)}
                    onCheckBox={(ev) => handleChangeSelect(ev)}
                    group={group}
                    task={task}
                />
                <div className="min-table-cell table-cell-first-column task-title default-cell-color"
                    {...attributes}
                    {...listeners}
                >
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
            </GroupStickyColumns>
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
        </div>
    );
};

export default React.memo(GroupTableContentTask);
