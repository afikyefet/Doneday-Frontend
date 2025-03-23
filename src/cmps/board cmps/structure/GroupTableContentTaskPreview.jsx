import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditableText } from "@vibe/core";
import React from "react";
import { useSelector } from "react-redux";
import GroupPreRow from "./GroupPreRow";
import GroupScrollableColumns from "./GroupScrollableColumns";
import GroupStickyColumns from "./GroupStickyColumns";
import TaskDetailsTriggerCell from "./TaskDetailsTriggerCell";

const GroupTableContentTaskPreview = ({ task, group }) => {
    const cmpOrder = useSelector((state) => state.boardModule.cmpOrder);

    // Make this component draggable by using useDraggable.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useDraggable({
            id: task._id,
            data: { type: 'task', task, group },
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30000 : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="listitem"
            className="table-task-row"
            type="task"
            {...attributes}
            {...listeners}
        >
            <GroupStickyColumns>
                <GroupPreRow crudlType="task" group={group} task={task} />
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
            </GroupStickyColumns>
            <GroupScrollableColumns>
                {/* {cmpOrder.map(cmpType =>
          <DynamicColumn
            key={cmpType}
            cmpType={cmpType}
            info={task[cmpType]}
          />
        )} */}
            </GroupScrollableColumns>
        </div>
    );
};

export default GroupTableContentTaskPreview;
