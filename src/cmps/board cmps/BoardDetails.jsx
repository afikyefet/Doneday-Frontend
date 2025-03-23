import {
    closestCenter,
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    MouseSensor,
    PointerSensor,
    rectIntersection,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { updateBoard } from "../../store/actions/board.actions";
import { AddGroup } from "./structure/AddGroup";
import GroupContainer from "./structure/GroupContainer";
import GroupTableContentTask from "./structure/GroupTableContentTask";

// Custom hook for deep compare memoization
const useDeepCompareMemoize = (value) => {
    const ref = useRef();
    if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
        ref.current = value;
    }
    return ref.current;
};

export function BoardDetails() {
    const board = useSelector((storeState) => storeState.boardModule.board);
    const memoizedBoard = useDeepCompareMemoize(board);
    const selectedTasks = useSelector(
        (storeState) => storeState.taskSelectModule.selectedTasks ?? []
    );

    const [activeId, setActiveId] = useState(null);
    // We'll use a local state for a preview board that updates during drag.
    const [previewBoard, setPreviewBoard] = useState(memoizedBoard);

    // Whenever the persistent board changes, update the preview.
    useEffect(() => {
        setPreviewBoard(memoizedBoard);
    }, [memoizedBoard]);

    // Set up sensors with default constraints.
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 2 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Advanced collision detection strategy.
    const collisionDetectionStrategy = useCallback((args) => {
        const intersections = rectIntersection(args);
        return intersections.length
            ? closestCenter({ ...args, droppableContainers: intersections })
            : closestCorners(args);
    }, []);

    // Helpers for type checking.
    const isTask = useCallback((id) => typeof id === "string" && id.charAt(0) === "t", []);
    const isGroup = useCallback((id) => typeof id === "string" && id.charAt(0) === "g", []);

    // Memoized lookup for items on the board.
    const findValueOfItems = useCallback(
        (id, type) => {
            if (!memoizedBoard || !memoizedBoard.groups) return null;
            if (type === "group") {
                return memoizedBoard.groups.find((group) => group._id === id);
            }
            if (type === "task") {
                for (const group of memoizedBoard.groups) {
                    const task = group.tasks.find((task) => task._id === id);
                    if (task) return { task, group };
                }
            }
            return null;
        },
        [memoizedBoard]
    );

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    // DRAG MOVE: Update preview state when a task is dragged into another group.
    const handleDragMove = useCallback(
        debounce((event) => {
            const { active, over } = event;
            if (!over) return;

            // Check for task drag between different groups.
            if (isTask(active.id) && isGroup(over.id)) {
                const activeData = findValueOfItems(active.id, "task");
                if (activeData && activeData.group._id !== over.id) {
                    const updatedBoard = structuredClone(memoizedBoard);
                    const sourceGroupIndex = updatedBoard.groups.findIndex(
                        (g) => g._id === activeData.group._id
                    );
                    if (sourceGroupIndex === -1) return;
                    const taskIndex = updatedBoard.groups[sourceGroupIndex].tasks.findIndex(
                        (t) => t._id === active.id
                    );
                    if (taskIndex === -1) return;
                    const [movedTask] = updatedBoard.groups[sourceGroupIndex].tasks.splice(taskIndex, 1);

                    const targetGroupIndex = updatedBoard.groups.findIndex((g) => g._id === over.id);
                    if (targetGroupIndex === -1) return;
                    movedTask.groupId = updatedBoard.groups[targetGroupIndex]._id;
                    updatedBoard.groups[targetGroupIndex].tasks.push(movedTask);

                    setPreviewBoard(updatedBoard);
                }
            }
        }, 50),
        [memoizedBoard, findValueOfItems, isTask, isGroup]
    );

    // DRAG END: Commit the change to the persistent board state.
    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;
            if (!over) return;

            // GROUP reordering.
            if (isGroup(active.id) && isGroup(over.id) && active.id !== over.id) {
                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === active.id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === over.id
                );
                if (activeGroupIndex === -1 || overGroupIndex === -1) return;
                const updatedBoard = structuredClone(memoizedBoard);
                updatedBoard.groups = arrayMove(
                    updatedBoard.groups,
                    activeGroupIndex,
                    overGroupIndex
                );
                updateBoard(updatedBoard);
            }
            // TASK reordering or moving between groups.
            else if (isTask(active.id) && isTask(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overData = findValueOfItems(over.id, "task");
                if (!activeData || !overData) return;

                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
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

                const updatedBoard = structuredClone(memoizedBoard);
                const { data } = over;
                const visualIndex = data?.current?.sortable?.index ?? overTaskIndex;
                const direction =
                    activeData.group._id === overData.group._id && visualIndex > activeTaskIndex ? 1 : -1;
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
            // TASK dropped onto a GROUP container.
            else if (isTask(active.id) && isGroup(over.id) && active.id !== over.id) {
                const activeData = findValueOfItems(active.id, "task");
                const overGroup = findValueOfItems(over.id, "group");
                if (!activeData || !overGroup) return;

                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === overGroup._id
                );
                if (activeGroupIndex === -1 || overGroupIndex === -1) return;

                const activeTaskIndex = activeData.group.tasks.findIndex(
                    (task) => task._id === active.id
                );
                if (activeTaskIndex === -1) return;

                const updatedBoard = structuredClone(memoizedBoard);
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                updatedBoard.groups[overGroupIndex].tasks.push(movedTask);
                updateBoard(updatedBoard);
            }

            // Reset preview state to the persistent board once drag ends.
            setPreviewBoard(memoizedBoard);
            setActiveId(null);
        },
        [memoizedBoard, findValueOfItems, isGroup, isTask]
    );

    const activeItem =
        activeId && (isGroup(activeId) ? findValueOfItems(activeId, "group") : findValueOfItems(activeId, "task"));

    if (!previewBoard || !previewBoard.groups) return null;

    return (
        <section className="board-details">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            >
                <SortableContext
                    items={previewBoard.groups.map((group) => group._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {previewBoard.groups.map((group) => (
                        <GroupContainer group={group} key={group._id} selectedTasks={selectedTasks} />
                    ))}
                </SortableContext>
                <AddGroup />
                <DragOverlay dropAnimation={null}>
                    {activeItem ? (
                        isGroup(activeId) ? (
                            // Render a group overlay – you might want a simplified version
                            <GroupContainer group={activeItem} selectedTasks={selectedTasks} />
                        ) : (
                            // Render a task overlay.
                            <GroupTableContentTask task={activeItem.task} group={activeItem.group} />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </section>
    );
}
