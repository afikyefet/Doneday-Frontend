import { closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateBoard } from "../../store/actions/board.actions"
import { AddGroup } from "./structure/AddGroup"
import GroupContainer from "./structure/GroupContainer"

export function BoardDetails() {
    const board = useSelector(storeState => storeState.boardModule.board)
    const selectedTasks = useSelector(storeState => storeState.taskSelectModule.selectedTasks ?? [])

    const [activeId, setActiveId] = useState(null);
    const [currentContainerId, setCurrentContainerId] = useState();
    const dispatch = useDispatch()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragStart(event) {
        const { active } = event;
        const { id } = active;
        setActiveId(id);
    }

    function findValueOfItems(id, type) {
        // For finding a group
        if (type === 'group') {
            return board.groups.find(group => group._id === id);
        }

        // For finding a task and its containing group
        if (type === 'task') {
            for (const group of board.groups) {
                const task = group.tasks.find(task => task._id === id);
                if (task) {
                    return { task, group };
                }
            }
            return null;
        }
    }

    // Additional helper functions based on the fixed findValueOfItems
    function findTaskTitle(id) {
        const result = findValueOfItems(id, 'task');
        if (!result) return '';
        return result.task.taskTitle;
    }

    function findGroupName(id) {
        const group = findValueOfItems(id, 'group');
        if (!group) return '';
        return group.name;
    }

    function findGroupTasks(id) {
        const group = findValueOfItems(id, 'group');
        if (!group) return [];
        return group.tasks;
    }

    const handleDragMove = useCallback((event) => {
        const { active, over } = event;

        if (!over) return;

        // Handle Tasks Sorting
        if (
            active.id.toString().includes('t') &&
            over?.id.toString().includes('t') &&
            active.id !== over.id
        ) {
            // Find the active and over task info
            const activeData = findValueOfItems(active.id, 'task');
            const overData = findValueOfItems(over.id, 'task');

            // If the active or over task info is not found, return
            if (!activeData || !overData) return;

            // Find the index of the active and over groups
            const activeGroupIndex = board.groups.findIndex(
                (group) => group._id === activeData.group._id
            );
            const overGroupIndex = board.groups.findIndex(
                (group) => group._id === overData.group._id
            );

            if (activeGroupIndex === -1 || overGroupIndex === -1) return;

            // Find the index of the active and over tasks
            const activeTaskIndex = activeData.group.tasks.findIndex(
                (task) => task._id === active.id
            );
            const overTaskIndex = overData.group.tasks.findIndex(
                (task) => task._id === over.id
            );

            if (activeTaskIndex === -1 || overTaskIndex === -1) return;

            // Create a new board to update
            const updatedBoard = { ...board };

            // In the same group, just reorder tasks
            if (activeGroupIndex === overGroupIndex) {
                updatedBoard.groups[activeGroupIndex].tasks = arrayMove(
                    updatedBoard.groups[activeGroupIndex].tasks,
                    activeTaskIndex,
                    overTaskIndex
                );
            } else {
                // Different groups - move the task from one to another
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                    activeTaskIndex,
                    1
                );

                // Update task's groupId to match its new group
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

                // Insert task at the proper position
                updatedBoard.groups[overGroupIndex].tasks.splice(
                    overTaskIndex,
                    0,
                    movedTask
                );
            }

            // Update the board
            // dispatch(updateBoard(updatedBoard))

        }

        // Handling Task Drop Into a Group
        if (
            active.id.toString().includes('t') &&
            over?.id.toString().includes('g') &&
            active.id !== over.id
        ) {
            // Find the active task and over group
            const activeData = findValueOfItems(active.id, 'task');
            const overGroup = findValueOfItems(over.id, 'group');

            // If the active task info or over group is not found, return
            if (!activeData || !overGroup) return;

            // Find the index of the active group and over group
            const activeGroupIndex = board.groups.findIndex(
                (group) => group._id === activeData.group._id
            );
            const overGroupIndex = board.groups.findIndex(
                (group) => group._id === overGroup._id
            );

            if (activeGroupIndex === -1 || overGroupIndex === -1) return;

            // Find the index of the active task
            const activeTaskIndex = activeData.group.tasks.findIndex(
                (task) => task._id === active.id
            );

            if (activeTaskIndex === -1) return;

            // Create a new board to update
            const updatedBoard = { ...board };

            // Remove task from source group
            const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                activeTaskIndex,
                1
            );

            // Update task's groupId to match its new group
            movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

            // Add task to the end of destination group
            updatedBoard.groups[overGroupIndex].tasks.push(movedTask);

            // Update the board
            // updateBoard(updatedBoard)
            // dispatch(updateBoard(updatedBoard))
        }
    }, [board]);

    // This is the function that handles the sorting of groups and tasks when the user is done dragging
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        // Handling Group Sorting
        if (
            active.id.toString().includes('g') &&
            over?.id.toString().includes('g') &&
            active.id !== over.id
        ) {
            // Find the index of the active and over groups
            const activeGroupIndex = board.groups.findIndex(
                (group) => group._id === active.id
            );
            const overGroupIndex = board.groups.findIndex(
                (group) => group._id === over.id
            );

            if (activeGroupIndex === -1 || overGroupIndex === -1) {
                setActiveId(null);
                return;
            }

            // Create a new board to update
            const updatedBoard = { ...board };

            // Reorder the groups
            updatedBoard.groups = arrayMove(
                updatedBoard.groups,
                activeGroupIndex,
                overGroupIndex
            );

            // Update the board
            dispatch(updateBoard(updatedBoard))
        }

        // Handling Task Sorting - similar to handleDragMove but complete the action on drag end
        if (
            active.id.toString().includes('t') &&
            over?.id.toString().includes('t') &&
            active.id !== over.id
        ) {
            // Find the active and over task info
            const activeData = findValueOfItems(active.id, 'task');
            const overData = findValueOfItems(over.id, 'task');

            // If the active or over task info is not found, return
            if (!activeData || !overData) {
                setActiveId(null);
                return;
            }

            // Find the index of the active and over groups
            const activeGroupIndex = board.groups.findIndex(
                (group) => group._id === activeData.group._id
            );
            const overGroupIndex = board.groups.findIndex(
                (group) => group._id === overData.group._id
            );

            if (activeGroupIndex === -1 || overGroupIndex === -1) {
                setActiveId(null);
                return;
            }

            // Find the index of the active and over tasks
            const activeTaskIndex = activeData.group.tasks.findIndex(
                (task) => task._id === active.id
            );
            const overTaskIndex = overData.group.tasks.findIndex(
                (task) => task._id === over.id
            );

            if (activeTaskIndex === -1 || overTaskIndex === -1) {
                setActiveId(null);
                return;
            }

            // Create a new board to update
            const updatedBoard = { ...board };

            // In the same group, just reorder tasks
            if (activeGroupIndex === overGroupIndex) {
                updatedBoard.groups[activeGroupIndex].tasks = arrayMove(
                    updatedBoard.groups[activeGroupIndex].tasks,
                    activeTaskIndex,
                    overTaskIndex
                );
            } else {
                // Different groups - move the task from one to another
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                    activeTaskIndex,
                    1
                );

                // Update task's groupId to match its new group
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

                // Insert task at the proper position
                updatedBoard.groups[overGroupIndex].tasks.splice(
                    overTaskIndex,
                    0,
                    movedTask
                );
            }

            // Update the board
            dispatch(updateBoard(updatedBoard))
        }

        // Handling Task dropping into a Group
        if (
            active.id.toString().includes('t') &&
            over?.id.toString().includes('g') &&
            active.id !== over.id
        ) {
            // Find the active task and over group
            const activeData = findValueOfItems(active.id, 'task');
            const overGroup = findValueOfItems(over.id, 'group');

            // If the active task info or over group is not found, return
            if (!activeData || !overGroup) {
                setActiveId(null);
                return;
            }

            // Find the index of the active group and over group
            const activeGroupIndex = board.groups.findIndex(
                (group) => group._id === activeData.group._id
            );
            const overGroupIndex = board.groups.findIndex(
                (group) => group._id === overGroup._id
            );

            if (activeGroupIndex === -1 || overGroupIndex === -1) {
                setActiveId(null);
                return;
            }

            // Find the index of the active task
            const activeTaskIndex = activeData.group.tasks.findIndex(
                (task) => task._id === active.id
            );

            if (activeTaskIndex === -1) {
                setActiveId(null);
                return;
            }

            // Create a new board to update
            const updatedBoard = { ...board };

            // Remove task from source group
            const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                activeTaskIndex,
                1
            );

            // Update task's groupId to match its new group
            movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

            // Add task to the end of destination group
            updatedBoard.groups[overGroupIndex].tasks.push(movedTask);

            // Update the board
            updateBoard(updatedBoard)
        }

        setActiveId(null);
    }, [board])

    // const onDragEnd = (dragEvent) => {
    //     const { active, over } = dragEvent
    //     if (!over || !active || active.id === over.id) return

    //     const updatedBoard = { ...board }

    //     const oldIndex = updatedBoard.groups.findIndex(group => group._id === active.id)
    //     const newIndex = updatedBoard.groups.findIndex(group => group._id === over.id)

    //     updatedBoard.groups = arrayMove(updatedBoard.groups, oldIndex, newIndex)

    //     setBoard(updatedBoard)
    //     updateBoard(updatedBoard)
    // }

    // const boardGroupIds = useMemo(() => board.groups.map(g => g._id), [board])

    if (!board || !board.groups) return null
    return (
        <section className="board-details">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={board.groups.map(group => group._id)}>
                    {board.groups.map((group, index) => (
                        <GroupContainer
                            group={group}
                            key={group._id}
                            index={index}
                            selectedTasks={selectedTasks}
                        />
                    ))}
                </SortableContext>
                <AddGroup />
                <DragOverlay adjustScale>
                    {activeId && activeId.toString().includes('t') && (
                        <TaskPreview id={activeId} task={findValueOfItems(activeId, 'task')?.task} />
                    )}
                    {activeId && activeId.toString().includes('g') && (
                        <GroupPreview id={activeId} group={findValueOfItems(activeId, 'group')} />
                    )}
                </DragOverlay>
            </DndContext>
        </section>
    )
}