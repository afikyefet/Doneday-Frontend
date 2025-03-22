import { closestCenter, closestCorners, DndContext, DragOverlay, KeyboardSensor, MouseSensor, PointerSensor, rectIntersection, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useCallback, useState } from "react"
import { useSelector } from "react-redux"
import { updateBoard } from "../../store/actions/board.actions"
import { AddGroup } from "./structure/AddGroup"
import GroupContainer from "./structure/GroupContainer"

export function BoardDetails() {
    const board = useSelector(storeState => storeState.boardModule.board)
    const selectedTasks = useSelector(storeState => storeState.taskSelectModule.selectedTasks ?? [])

    const [activeId, setActiveId] = useState(null);
    const [currentContainerId, setCurrentContainerId] = useState();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const collisionDetectionStrategy = useCallback((args) => {
        // First, find all intersecting droppables
        const intersections = rectIntersection(args);

        // If there are intersecting droppables, choose the closest one
        if (intersections.length > 0) {
            // Return closest center
            return closestCenter({
                ...args,
                droppableContainers: intersections
            });
        }

        // Otherwise use a more generous detection strategy
        return closestCorners(args);
    }, []);

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

    const handleDragMove = (event) => {
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
    };

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        // ----- 1. Handling Group Sorting -----
        if (
            active.id.toString().includes('g') &&
            over.id.toString().includes('g') &&
            active.id !== over.id
        ) {
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

            const updatedBoard = { ...board };
            updatedBoard.groups = arrayMove(
                updatedBoard.groups,
                activeGroupIndex,
                overGroupIndex
            );

            updateBoard(updatedBoard);
        }
        // ----- 2. Handling Task Sorting (dragging task onto another task) -----
        else if (
            active.id.toString().includes('t') &&
            over.id.toString().includes('t') &&
            active.id !== over.id
        ) {
            const activeData = findValueOfItems(active.id, 'task');
            const overData = findValueOfItems(over.id, 'task');

            if (!activeData || !overData) {
                setActiveId(null);
                return;
            }

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

            // Find task indices
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

            const updatedBoard = structuredClone(board); // deep copy for safety

            // Get modifier data from dnd-kit’s over object to ensure consistency
            const { data } = over;
            const visualIndex = data?.current?.sortable?.index ?? overTaskIndex;
            const direction =
                data?.current?.sortable?.containerId === activeData.group._id
                    ? (visualIndex > activeTaskIndex ? 1 : -1)
                    : 0;

            if (activeData.group._id === overData.group._id) {
                // Same group reordering
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                    activeTaskIndex,
                    1
                );
                let insertIndex = visualIndex;
                if (direction === 1 && activeTaskIndex < visualIndex) {
                    insertIndex -= 1;
                }
                updatedBoard.groups[activeGroupIndex].tasks.splice(insertIndex, 0, movedTask);
            } else {
                // Moving task between groups
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                    activeTaskIndex,
                    1
                );
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                updatedBoard.groups[overGroupIndex].tasks.splice(visualIndex, 0, movedTask);
            }

            updateBoard(updatedBoard);
        }
        // ----- 3. Handling Task Dropping into a Group (e.g. onto a group header) -----
        else if (
            active.id.toString().includes('t') &&
            over.id.toString().includes('g') &&
            active.id !== over.id
        ) {
            const activeData = findValueOfItems(active.id, 'task');
            const overGroup = findValueOfItems(over.id, 'group');

            if (!activeData || !overGroup) {
                setActiveId(null);
                return;
            }

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

            const activeTaskIndex = activeData.group.tasks.findIndex(
                (task) => task._id === active.id
            );

            if (activeTaskIndex === -1) {
                setActiveId(null);
                return;
            }

            const updatedBoard = { ...board };
            const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                activeTaskIndex,
                1
            );
            movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

            const cursorY = event.activatorEvent?.clientY || 0;
            const groupElement = document.querySelector(`[data-group-id="${overGroup._id}"]`);

            if (groupElement) {
                const groupRect = groupElement.getBoundingClientRect();
                const groupTasks = updatedBoard.groups[overGroupIndex].tasks;
                if (groupTasks.length === 0) {
                    groupTasks.push(movedTask);
                } else {
                    let insertIndex = groupTasks.length;
                    const taskElements = Array.from(groupElement.querySelectorAll('[data-task-id]'));
                    for (let i = 0; i < taskElements.length; i++) {
                        const taskRect = taskElements[i].getBoundingClientRect();
                        const taskMidY = taskRect.top + taskRect.height / 2;
                        if (cursorY < taskMidY) {
                            insertIndex = i;
                            break;
                        }
                    }
                    groupTasks.splice(insertIndex, 0, movedTask);
                }
            } else {
                updatedBoard.groups[overGroupIndex].tasks.push(movedTask);
            }

            updateBoard(updatedBoard);
        }

        setActiveId(null);
    }, [board]);


    if (!board || !board.groups) return null
    return (
        <section className="board-details">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={board.groups.map(group => group._id)}>
                    {board.groups.map((group) => (
                        <GroupContainer
                            group={group}
                            key={group._id}
                            selectedTasks={selectedTasks}
                        />
                    ))}
                </SortableContext>
                <AddGroup />
                {/* <DragOverlay adjustScale>
                    {activeId && activeId.toString().includes('t') && (
                        <TaskPreview id={activeId} task={findValueOfItems(activeId, 'task')?.task} />
                    )}
                    {activeId && activeId.toString().includes('g') && (
                        <GroupPreview id={activeId} group={findValueOfItems(activeId, 'group')} />
                    )}
                </DragOverlay> */}
            </DndContext>
        </section>
    )
}