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
import React, { useCallback, useMemo, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { updateBoard } from "../../store/actions/board.actions";
import { AddGroup } from "./structure/AddGroup";
import GroupContainer from "./structure/GroupContainer";
import GroupContainerPreview from "./structure/GroupContainerPreview";
import GroupTableContentTaskPreview from "./structure/GroupTableContentTaskPreview";

export function BoardDetails() {
    // Use shallowEqual so that we don't trigger re-renders unless board parts really change.
    const board = useSelector(
        (storeState) => storeState.boardModule.board,
        shallowEqual
    );
    const selectedTasks = useSelector(
        (storeState) => storeState.taskSelectModule.selectedTasks ?? [],
        shallowEqual
    );
    const [activeId, setActiveId] = useState(null);

    // Memoize groups map for quick lookup.
    const groupsById = useMemo(() => {
        if (!board?.groups) return {};
        return board.groups.reduce((acc, group) => {
            acc[group._id] = group;
            return acc;
        }, {});
    }, [board?.groups]);

    // Memoize tasks map for quick lookup.
    const tasksMap = useMemo(() => {
        const map = {};
        if (!board?.groups) return map;
        board.groups.forEach((group) => {
            group.tasks.forEach((task) => {
                map[task._id] = { task, group };
            });
        });
        return map;
    }, [board?.groups]);

    // Helper functions to determine type
    const isTask = useCallback((id) => id.toString().includes("t"), []);
    const isGroup = useCallback((id) => id.toString().includes("g"), []);

    // Memoized helper to find items using our maps.
    const findValueOfItems = useCallback(
        (id, type) => {
            if (type === "group") {
                return groupsById[id];
            }
            if (type === "task") {
                return tasksMap[id] || null;
            }
        },
        [groupsById, tasksMap]
    );

    // Define sensors for dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Collision detection strategy
    const collisionDetectionStrategy = useCallback((args) => {
        const intersections = rectIntersection(args);
        return intersections.length
            ? closestCenter({ ...args, droppableContainers: intersections })
            : closestCorners(args);
    }, []);

    // DRAG START: Store the active ID
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    // DRAG MOVE: Throttled to improve performance.
    const throttledDragMove = useMemo(
        () =>
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
                    updateBoard(updatedBoard);
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
                    updateBoard(updatedBoard);
                }
            }, 50),
        [board, findValueOfItems, isTask, isGroup]
    );

    const handleDragMove = useCallback((event) => {
        throttledDragMove(event);
    }, [throttledDragMove]);

    // DRAG END: Update the board state permanently.
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
                // Get pointer position to decide insertion index
                const pointerY = event.activatorEvent?.clientY || 0;
                const overElement = document.querySelector(`[data-task-id="${over.id}"]`);
                let newIndex = overTaskIndex;
                if (overElement) {
                    const { top, height } = overElement.getBoundingClientRect();
                    const midY = top + height / 2;
                    newIndex = pointerY > midY ? overTaskIndex + 1 : overTaskIndex;
                }

                if (activeData.group._id === overData.group._id) {
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                        activeTaskIndex,
                        1
                    );
                    if (activeTaskIndex < newIndex) {
                        newIndex = newIndex - 1;
                    }
                    updatedBoard.groups[activeGroupIndex].tasks.splice(newIndex, 0, movedTask);
                } else {
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(
                        activeTaskIndex,
                        1
                    );
                    movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                    updatedBoard.groups[overGroupIndex].tasks.splice(newIndex, 0, movedTask);
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
        [board, findValueOfItems, isGroup, isTask]
    );

    const activeItem = useMemo(
        () => activeId &&
            (activeId.toString().includes("g")
                ? findValueOfItems(activeId, "group")
                : findValueOfItems(activeId, "task"))
        , [activeId])
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
                                <GroupTableContentTaskPreview task={activeItem.task} group={activeItem.group} />
                            </section>
                        ) : (
                            <GroupContainerPreview isForceCollapsed={true} group={activeItem} selectedTasks={selectedTasks} />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </section>
    );
}
