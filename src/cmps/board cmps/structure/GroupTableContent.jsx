import { DndContext, MouseSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { updateBoard } from "../../../store/actions/board.actions";
import GroupTableContentTask from "./GroupTableContentTask";

const GroupTableContent = ({ group }) => {
    // Maintain a local state for tasks
    const [tasks, setTasks] = useState(group.tasks);
    const board = useSelector(stateStore => stateStore.boardModule.board)

    useEffect(() => {
        // When group.tasks changes externally, update local state
        setTasks(group.tasks);
    }, [group.tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
    )

    const onDragEnd = useCallback(async (dragEvent) => {
        const { active, over } = dragEvent;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex(task => task._id === active.id);
        const newIndex = tasks.findIndex(task => task._id === over.id);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);

        const newBoard = { ...board };
        const groupIndex = newBoard.groups.findIndex(g => g._id === group._id);
        if (groupIndex === -1) {
            console.error(`Group with id ${group._id} not found in board`);
            return;
        }
        newBoard.groups[groupIndex].tasks = newTasks;

        try {
            await updateBoard(newBoard);
        } catch (err) {
            console.error("Error updating board: ", err);
        }
    }, [tasks, group, board]);


    return (
        <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
            <SortableContext
                items={tasks.map(task => task._id)}
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
        </DndContext>
    );
}

export default GroupTableContent;
