import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";
import GroupTableContentTask from "./GroupTableContentTask";

const GroupTableContent = ({ group }) => {
    // Maintain a local state for tasks
    const [tasks, setTasks] = useState(group.tasks || []);

    useEffect(() => {
        setTasks(group.tasks);
    }, [group.tasks]);

    return (
        <SortableContext items={group?.tasks?.map(group => group._id)}
            strategy={verticalListSortingStrategy}
        >
            <section className="group-table-content">
                {tasks.map(task =>
                    <GroupTableContentTask
                        key={task._id}
                        task={task}
                        group={group}
                    />
                )}
            </section>
        </SortableContext>
    );
}

export default GroupTableContent;
