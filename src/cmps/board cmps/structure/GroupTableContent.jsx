// GroupTableContent.jsx
import React, { useMemo } from "react";
import GroupTableContentTask from "./GroupTableContentTask";

const GroupTableContent = ({ group, onUpdateTask, selectedTasks, cmpOrder }) => {
    const taskIds = useMemo(() => group?.tasks?.map(task => task._id), [group.tasks]);

    return (
        <section className="group-table-content">
            {group.tasks.map(task => (
                <GroupTableContentTask
                    key={task._id}
                    task={task}
                    group={group}
                    onUpdateTask={onUpdateTask}
                    selectedTasks={selectedTasks}
                    cmpOrder={cmpOrder}
                />
            ))}
        </section>
        // </SortableContext >
    );
};

export default React.memo(GroupTableContent);
