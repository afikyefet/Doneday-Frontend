import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import debounce from "lodash/debounce";
import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBoard } from "../../store/actions/board.actions";
import { AddGroup } from "./structure/AddGroup";
import GroupContainer from "./structure/GroupContainer";
import GroupTableContentTask from "./structure/GroupTableContentTask";

// Custom hook for deep compare memoization (prevents re-renders if board hasn’t changed)
const useDeepCompareMemoize = (value) => {
    const ref = useRef();
    const signal = JSON.stringify(value);
    if (signal !== ref.current) {
        ref.current = signal;
    }
    return value;
};

export function BoardDetails() {
    const board = useSelector((state) => state.boardModule.board);
    const memoizedBoard = useDeepCompareMemoize(board);
    const selectedTasks = useSelector((state) => state.taskSelectModule.selectedTasks ?? []);
    const dispatch = useDispatch();

    const [activeId, setActiveId] = useState(null);

    // Call useSensors at the top level.
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 2 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Helper: Lookup a group or task (with its group) by id.
    const findValueOfItems = useCallback(
        (id, type) => {
            if (!memoizedBoard?.groups) return null;
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

    // Debounced drag move handler.
    const handleDragMove = useCallback(
        debounce((event) => {
            const { active, over } = event;
            if (!over) return;

            // Example: when dragging a task over a group header,
            // you might update a preview. (Optional)
            if (
                active.id.toString().includes("t") &&
                over.id.toString().includes("g") &&
                active.id !== over.id
            ) {
                const activeData = findValueOfItems(active.id, "task");
                const overGroup = findValueOfItems(over.id, "group");
                if (!activeData || !overGroup) return;
                // (Optional) Preview logic can be added here.
            }
        }, 50),
        [memoizedBoard, findValueOfItems]
    );

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;
            if (!over) {
                setActiveId(null);
                return;
            }

            // Group reordering.
            if (
                active.id.toString().includes("g") &&
                over.id.toString().includes("g") &&
                active.id !== over.id
            ) {
                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === active.id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === over.id
                );
                if (activeGroupIndex === -1 || overGroupIndex === -1) {
                    setActiveId(null);
                    return;
                }
                const updatedBoard = structuredClone(memoizedBoard);
                updatedBoard.groups = arrayMove(updatedBoard.groups, activeGroupIndex, overGroupIndex);
                dispatch(updateBoard(updatedBoard));
            }
            // Task reordering (dragging onto a task).
            else if (
                active.id.toString().includes("t") &&
                over.id.toString().includes("t") &&
                active.id !== over.id
            ) {
                const activeData = findValueOfItems(active.id, "task");
                const overData = findValueOfItems(over.id, "task");
                if (!activeData || !overData) {
                    setActiveId(null);
                    return;
                }
                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
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
                const updatedBoard = structuredClone(memoizedBoard);
                // Use modifier data if available.
                const { data } = over;
                const visualIndex = data?.current?.sortable?.index ?? overTaskIndex;
                const direction =
                    activeData.group._id === overData.group._id && visualIndex > activeTaskIndex ? 1 : -1;
                if (activeData.group._id === overData.group._id) {
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                    let insertIndex = visualIndex;
                    if (direction === 1 && activeTaskIndex < visualIndex) {
                        insertIndex -= 1;
                    }
                    updatedBoard.groups[activeGroupIndex].tasks.splice(insertIndex, 0, movedTask);
                } else {
                    const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                    movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                    updatedBoard.groups[overGroupIndex].tasks.splice(visualIndex, 0, movedTask);
                }
                dispatch(updateBoard(updatedBoard));
            }
            // Task dropped onto a Group header.
            else if (
                active.id.toString().includes("t") &&
                over.id.toString().includes("g") &&
                active.id !== over.id
            ) {
                const activeData = findValueOfItems(active.id, "task");
                const overGroup = findValueOfItems(over.id, "group");
                if (!activeData || !overGroup) {
                    setActiveId(null);
                    return;
                }
                const activeGroupIndex = memoizedBoard.groups.findIndex(
                    (group) => group._id === activeData.group._id
                );
                const overGroupIndex = memoizedBoard.groups.findIndex(
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
                const updatedBoard = structuredClone(memoizedBoard);
                const [movedTask] = updatedBoard.groups[activeGroupIndex].tasks.splice(activeTaskIndex, 1);
                movedTask.groupId = updatedBoard.groups[overGroupIndex]._id;
                updatedBoard.groups[overGroupIndex].tasks.push(movedTask);
                dispatch(updateBoard(updatedBoard));
            }
            setActiveId(null);
        },
        [memoizedBoard, findValueOfItems, dispatch]
    );

    // Derive the active item for the DragOverlay.
    const activeItem =
        activeId &&
        (activeId.toString().includes("g")
            ? findValueOfItems(activeId, "group")
            : findValueOfItems(activeId, "task"));

    if (!memoizedBoard || !memoizedBoard.groups) return null;

    return (
        <section className="board-details">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={memoizedBoard.groups.map((group) => group._id)}>
                    {memoizedBoard.groups.map((group, index) => (
                        <GroupContainer
                            group={group}
                            key={group._id}
                            index={index}
                            selectedTasks={selectedTasks}
                        />
                    ))}
                </SortableContext>
                <AddGroup />
                <DragOverlay dropAnimation={null}>
                    {activeItem ? (
                        activeId.toString().includes("t") ? (
                            <section className="group-table-content">

                                <GroupTableContentTask
                                    task={activeItem.task}
                                    group={activeItem.group}
                                />
                            </section>
                        ) : (
                            <GroupContainer
                                group={activeItem}
                                selectedTasks={selectedTasks}
                            />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </section>
    );
}
