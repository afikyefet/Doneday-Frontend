import {
    closestCenter,
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MouseSensor,
    PointerSensor,
    rectIntersection,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import throttle from "lodash/throttle";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { updateBoard } from "../../store/actions/board.actions";
import { AddGroup } from "./structure/AddGroup";
import GroupContainer from "./structure/GroupContainer";
import GroupContainerPreview from "./structure/GroupContainerPreview";
import GroupTableContentTask from "./structure/GroupTableContentTask";

export function BoardDetails() {
    const board = useSelector((storeState) => storeState.boardModule.board);
    const selectedTasks = useSelector(
        (storeState) => storeState.taskSelectModule.selectedTasks ?? []
    );
    const [activeId, setActiveId] = useState(null);

    // Define sensors for dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    // Collision detection strategy: use rectIntersection then decide which algorithm to use.
    const collisionDetectionStrategy = useCallback((args) => {
        const intersections = rectIntersection(args);
        return intersections.length
            ? closestCenter({ ...args, droppableContainers: intersections })
            : closestCorners(args);
    }, []);

    // Helper functions to determine type
    const isTask = (id) => id.toString().includes("t");
    const isGroup = (id) => id.toString().includes("g");

    // Memoized helper to find items in board
    const findValueOfItems = useCallback(
        (id, type) => {
            if (type === "group") {
                return board.groups.find((group) => group._id === id);
            }
            if (type === "task") {
                for (const group of board.groups) {
                    const task = group.tasks.find((task) => task._id === id);
                    if (task) return { task, group };
                }
                return null;
            }
        },
        [board]
    );

    // DRAG START: Store the active ID
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    // DRAG MOVE: Throttled to improve performance
    const handleDragMove = useCallback(
        throttle((event) => {
            const { active, over } = event;
            if (!over) return;

            // TASK <-> TASK move preview
            if (isTask(active.id) && isTask(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overData = findValueOfItems(over.id, "task");
                if (!activeData || !overData) return;

                const activeGroupIndex = board.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = board.groups.findIndex(
                    (group) => group._id === overData.group._id
                );
                if (activeGroupIndex === -1 || overGroupIndex === -1) return;

                const activeTaskIndex = activeData.group.tasks.findIndex(
                    (task) => task._id === active.id
                );
                const overTaskIndex = overData.group.tasks.findIndex(
                    (task) => task._id === over.id
                );
                if (activeTaskIndex === -1 || overTaskIndex === -1) return;

                const updatedBoard = { ...board };

                if (activeGroupIndex === overGroupIndex) {
                    updatedBoard.groups[activeGroupIndex].tasks = arrayMove(
                        updatedBoard.groups[activeGroupIndex].tasks,
                        activeTaskIndex,
                        overTaskIndex
                    );
                } else {
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                        activeTaskIndex,
                        1
                    );
                    movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                    updatedBoard.groups[overGroupIndex].tasks.splice(overTaskIndex, 0, movedTask);
                }
                // Optionally, you could update the board preview here:
                // updateBoard(updatedBoard)
            }

            // TASK dropping onto a GROUP (preview)
            if (isTask(active.id) && isGroup(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overGroup = findValueOfItems(over.id, "group");
                if (!activeData || !overGroup) return;

                const activeGroupIndex = board.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = board.groups.findIndex(
                    (group) => group._id === overGroup._id
                );
                if (activeGroupIndex === -1 || overGroupIndex === -1) return;

                const activeTaskIndex = activeData.group.tasks.findIndex(
                    (task) => task._id === active.id
                );
                if (activeTaskIndex === -1) return;

                const updatedBoard = { ...board };
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                updatedBoard.groups[overGroupIndex].tasks.push(movedTask);
                // Optionally, you could update the board preview here:
                // updateBoard(updatedBoard)
            }
        }, 50),
        [board, findValueOfItems]
    );

    // DRAG END: Update the board state permanently based on where the item was dropped.
    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;
            if (!over) {
                setActiveId(null);
                return;
            }

            // GROUP reordering
            if (isGroup(active.id) && isGroup(over.id) && active.id !== over.id) {
                const activeGroupIndex = board.groups.findIndex((group) => group._id === active.id);
                const overGroupIndex = board.groups.findIndex((group) => group._id === over.id);
                if (activeGroupIndex === -1 || overGroupIndex === -1) {
                    setActiveId(null);
                    return;
                }
                const updatedBoard = {
                    ...board,
                    groups: arrayMove(board.groups, activeGroupIndex, overGroupIndex),
                };
                updateBoard(updatedBoard);
            }
            // TASK reordering or moving between groups
            else if (isTask(active.id) && isTask(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overData = findValueOfItems(over.id, "task");
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
                const updatedBoard = structuredClone(board);
                const { data } = over;
                const visualIndex = data?.current?.sortable?.index ?? overTaskIndex;
                const direction =
                    data?.current?.sortable?.containerId === activeData.group._id
                        ? visualIndex > activeTaskIndex
                            ? 1
                            : -1
                        : 0;
                if (activeData.group._id === overData.group._id) {
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
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                        activeTaskIndex,
                        1
                    );
                    movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                    updatedBoard.groups[overGroupIndex].tasks.splice(visualIndex, 0, movedTask);
                }
                updateBoard(updatedBoard);
            }
            // TASK dropped onto a GROUP header
            else if (isTask(active.id) && isGroup(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overGroup = findValueOfItems(over.id, "group");
                if (!activeData || !overGroup) {
                    setActiveId(null);
                    return;
                }
                const activeGroupIndex = board.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = board.groups.findIndex((group) => group._id === overGroup._id);
                if (activeGroupIndex === -1 || overGroupIndex === -1) {
                    setActiveId(null);
                    return;
                }
                const activeTaskIndex = activeData.group.tasks.findIndex((task) => task._id === active.id);
                if (activeTaskIndex === -1) {
                    setActiveId(null);
                    return;
                }
                const updatedBoard = { ...board };
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;

                const cursorY = event.activatorEvent?.clientY || 0;
                const groupElement = document.querySelector(`[data-group-id="${overGroup._id}"]`);

                if (groupElement) {
                    const groupTasks = updatedBoard.groups[overGroupIndex].tasks;
                    if (groupTasks.length === 0) {
                        groupTasks.push(movedTask);
                    } else {
                        let insertIndex = groupTasks.length;
                        const taskElements = Array.from(groupElement.querySelectorAll("[data-task-id]"));
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
        },
        [board, findValueOfItems]
    );

    const activeItem =
        activeId &&
        (activeId.toString().includes("g")
            ? findValueOfItems(activeId, "group")
            : findValueOfItems(activeId, "task"));

    if (!board || !board.groups) return null;

    return (
        <section className="board-details">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={board.groups.map((group) => group._id)}>
                    {board.groups.map((group) => (
                        <GroupContainer
                            group={group}
                            key={group._id}
                            selectedTasks={selectedTasks}
                        />
                    ))}
                </SortableContext>
                <AddGroup />
                <DragOverlay>
                    {activeItem ? (
                        activeId.toString().includes("t") ? (
                            <section className="group-table-content">
                                <GroupTableContentTask task={activeItem.task} group={activeItem.group} />
                            </section>
                        ) : (
                            <GroupContainer isForceCollapsed={true} group={activeItem} selectedTasks={selectedTasks} />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </section>
    );
}
