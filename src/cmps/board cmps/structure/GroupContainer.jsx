import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../../services/util.service";
import { updateBoard } from "../../../store/actions/board.actions";
import { SET_GLOBALLY_COLLAPSED } from "../../../store/reducers/board.reducer";
import GroupHeader from "./GroupHeader";
import GroupSummaryRow from "./GroupSummaryRow";
import GroupTableContent from "./GroupTableContent";
import GroupTableFooter from "./GroupTableFooter";
import GroupTableHeader from "./GroupTableHeader";

const GroupContainer = ({ group, index, isForceCollapsed, selectedTasks, cmpOrder }) => {
    const dispatch = useDispatch();

    // Initialize collapsed state from isForceCollapsed.
    const [isCollapsed, setIsCollapsed] = useState(isForceCollapsed);
    const previousCollapsedValue = useRef(isCollapsed);

    // Subscribe only to the specific global flag you need.
    const isGloballyCollapsed = useSelector(
        (state) => state.boardModule.isGloballyCollapsed
    );

    // DND hooks for sorting and droppable functionality.
    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: group._id,
        data: { type: "group" },
        activationConstraint: { distance: 5 },
    });
    const { setNodeRef: setDroppableRef } = useDroppable({ id: group._id });

    // Synchronize local collapsed state with global flag.
    useEffect(() => {
        if (isGloballyCollapsed) {
            previousCollapsedValue.current = isCollapsed;
            setIsCollapsed(true);
        } else {
            setIsCollapsed(previousCollapsedValue.current);
        }
    }, [isGloballyCollapsed]);

    // Dispatch global collapse changes when dragging or force collapsing.
    useEffect(() => {
        dispatch({
            type: SET_GLOBALLY_COLLAPSED,
            isGloballyCollapsed: isDragging || isForceCollapsed,
        });
    }, [dispatch, isDragging, isForceCollapsed]);

    // Memoize the style object for the container.
    const style = useMemo(() => ({
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30000 : 0,
        opacity: isDragging ? 0 : 1,
    }), [transform, transition, isDragging]);

    // Define an update callback that will be passed to children.
    // It receives an updated task, updates the group's tasks, and then dispatches updateBoard.
    const handleUpdateTask = useCallback(
        async (updatedTask) => {
            const updatedTasks = group.tasks.map((t) =>
                t._id === updatedTask._id ? updatedTask : t
            );
            // Create a new group object with updated tasks.
            const updatedGroup = { ...group, tasks: updatedTasks };
            // Dispatch the updated board (depending on your state shape, you might update only this group).
            await dispatch(updateBoard(updatedGroup));
        },
        [group, dispatch]
    );

    // Memoize event handler for adding a task.
    const handleOnAddTask = useCallback((task) => {
        console.log('task: ' + task);
        // Additional logic here...
    }, []);

    // Memoize the array of task IDs for the SortableContext.
    const taskIds = useMemo(() => group?.tasks?.map(task => task._id), [group.tasks]);

    console.log("GroupContainer rendered");

    return (
        <section
            type="group"
            ref={setDroppableRef}
            className="group-container"
            role="rowgroup"
            style={{ zIndex: 2000 - (index * 10), ...style }}
        >


            <section role="rowheader" className={cn("group-header-container", !isCollapsed && "sticky-header")}>
                <div className="group-title-container" {...attributes} {...listeners}>
                    {isCollapsed && (
                        <div
                            style={{ backgroundColor: isDragging ? "transparent" : "white" }}
                            className="pre-collapsed-filler"
                        ></div>
                    )}
                    <GroupHeader
                        ref={setDraggableRef}
                        dndProps={{ ...attributes, ...listeners }}
                        isDragging={isDragging}
                        group={group}
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                    />
                </div>
                {!isCollapsed && <GroupTableHeader group={group} />}
            </section>
            {!isCollapsed && (
                <><SortableContext items={taskIds}>
                    <section role="rowgroup">
                        <GroupTableContent
                            group={group}
                            onUpdateTask={handleUpdateTask}
                            selectedTasks={selectedTasks}
                            cmpOrder={cmpOrder}
                        />
                    </section>
                    <footer>
                        <GroupTableFooter group={group} onAddTask={handleOnAddTask} />
                        <GroupSummaryRow group={group} />
                    </footer>
                </SortableContext>
                </>
            )}
            <div className="ghost-div"></div>
        </section>
    );
};

export default React.memo(GroupContainer);
