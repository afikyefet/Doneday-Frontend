import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../../services/util.service";
import { SET_GLOBALLY_COLLAPSED } from "../../../store/reducers/board.reducer";
import GroupHeader from "./GroupHeader";
import GroupSummaryRow from "./GroupSummaryRow";
import GroupTableContent from "./GroupTableContent";
import GroupTableFooter from "./GroupTableFooter";
import GroupTableHeader from "./GroupTableHeader";
const GroupContainer = ({ group, index, isForceCollapsed }) => {

    const [isCollapsed, setIsCollapsed] = useState(false || isForceCollapsed);
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, transition, isDragging } = useSortable(
        { id: group._id, data: { type: 'group' }, activationConstraint: { distance: 5 } });
    const { setNodeRef: setDroppableRef } = useDroppable({ id: group._id });

    const previousCollapsedValue = useRef(isCollapsed);
    const isGloballyCollapsed = useSelector(state => state.boardModule.isGloballyCollapsed)
    const dispatch = useDispatch();




    useEffect(() => {
        if (isGloballyCollapsed) {
            previousCollapsedValue.current = isCollapsed
            setIsCollapsed(true)
        } else {
            setIsCollapsed(previousCollapsedValue.current)
        }
    }, [isGloballyCollapsed])

    useEffect(() => {
        if (isDragging !== isGloballyCollapsed || isForceCollapsed) {
            dispatch({ type: SET_GLOBALLY_COLLAPSED, isGloballyCollapsed: isDragging || isForceCollapsed })
        }
    }, [isDragging])

    const handleOnAddTask = (task) => {
        console.log('task: ' + task);
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30000 : 0,
        opacity: isDragging ? 0 : 1
    };
    return <section type='group' ref={setDroppableRef} className="group-container" role="rowgroup" style={{ zIndex: 2000 - (index * 10), ...style }}>
        <section role="rowheader" className={cn("group-header-container", !isCollapsed && "sticky-header")}>
            <div className="group-title-container" {...attributes} {...listeners}>
                {isCollapsed && (
                    <div
                        style={{ backgroundColor: isDragging ? "transparent" : 'white' }}
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
        {
            !isCollapsed && <>
                <section role="rowgroup">
                    <GroupTableContent group={group} />
                </section>
                <footer>
                    <GroupTableFooter group={group} onAddTask={handleOnAddTask} />
                    <GroupSummaryRow group={group} />
                </footer>
            </>
        }
        <div className="ghost-div"></div>
    </section >
}

export default GroupContainer
