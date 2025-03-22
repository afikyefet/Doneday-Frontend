// GroupTableContentTask.jsx
import { EditableText } from "@vibe/core";
import React from "react";
import { useSelector } from "react-redux";
import GroupPreRow from "./GroupPreRow";
import GroupScrollableColumns from "./GroupScrollableColumns";
import GroupStickyColumns from "./GroupStickyColumns";
import TaskDetailsTriggerCell from "./TaskDetailsTriggerCell";

const GroupTableContentTaskPreview = ({ task, group }) => {

    const cmpOrder = useSelector(state => state.boardModule.cmpOrder);

    return (
        <div
            role="listitem"
            className="table-task-row"
            type='task'
        >
            <GroupStickyColumns>
                <GroupPreRow
                    crudlType="task"
                    group={group}
                    task={task}
                />
                <div className="min-table-cell table-cell-first-column task-title default-cell-color">
                    <div
                        className="task-title-container"
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                    >
                        <EditableText
                            className="task-title-display"
                            type="text2"
                            value={task.taskTitle}
                        />
                    </div>
                    <TaskDetailsTriggerCell task={task} />
                </div>
            </GroupStickyColumns >
            <GroupScrollableColumns>
                {/* {cmpOrder.map(cmpType =>
                    <DynamicColumn
                        key={cmpType}
                        cmpType={cmpType}
                        info={task[cmpType]}
                    />
                )} */}
            </GroupScrollableColumns>
        </div >
    );
}

export default GroupTableContentTaskPreview;
