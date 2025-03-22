import { SortableContext } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GroupTableContentTask from "./GroupTableContentTask";

const GroupTableContent = React.memo(({ group }) => {
    // Maintain a local state for tasks
    const [tasks, setTasks] = useState(group.tasks);
    const board = useSelector(stateStore => stateStore.boardModule.board)

    useEffect(() => {
        setTasks(group.tasks);
    }, [group.tasks]);

    return (
        <SortableContext items={group.tasks.map(group => group._id)}>
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
})

export default GroupTableContent;
