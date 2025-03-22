import { EditableHeading, Icon, Text } from "@vibe/core";
import { DropdownChevronDown, DropdownChevronRight } from "@vibe/icons";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { cn } from "../../../services/util.service";
import { updateBoard } from "../../../store/actions/board.actions";
import { TaskMenuButton } from "../CrudlMenuButtons/TaskMenuButton";
import ChevronTooltip from "./ChevronTooltip";
import DynamicSummary from "./DynamicSummary";



const GroupHeader = forwardRef(({ group, isCollapsed, setIsCollapsed, dndProps, isDragging }, ref) => {
    const tasksCount = group.tasks?.length || 0;
    const headingRef = useRef()
    const [headerColorTrigger, setHeaderColorTrigger] = useState(false)
    const board = useSelector(storeState => storeState.boardModule.board)
    const cmpOrder = useSelector(state => state.boardModule.cmpOrder)


    useEffect(() => {
        if (headingRef.current) {
            const h3HeaderColor = headingRef.current.querySelector("h3")
            h3HeaderColor.style.color = group.color;

            const inputHeaderColor = headingRef.current.querySelector("input")
            if (inputHeaderColor) {
                inputHeaderColor.style.color = group.color;
            }
        }
    }, [headingRef, headerColorTrigger])

    const groupCount = group.tasks?.length || 0;

    async function handleChangeName(name) {
        try {
            const newBoard = { ...board };
            const groupIndex = newBoard.groups.findIndex(g => g._id === group._id);
            if (groupIndex === -1) {
                throw new Error(`Group with id ${group._id} not found`);
            }
            newBoard.groups[groupIndex].name = name;
            await updateBoard(newBoard);
        } catch (err) {
            console.error('Group name could not be updated: ' + err);
        }
    }

    const collapsedStyle = isCollapsed ? { borderLeft: '6px solid' + (group.color || '#000') } : undefined

    return <>
        <section {...dndProps} className={cn(!isCollapsed && "group-header", isCollapsed && "group-header-collapsed group-collapsed-border")}
            style={collapsedStyle}
        >



            {!isCollapsed &&
                <div className="group-menu-button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}><TaskMenuButton crudlType={"group"} task={{}} group={group} /></div>}

            {isCollapsed &&
                <div
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setIsCollapsed(false)}>
                        <ChevronTooltip content='Expand group'>
                            <Icon style={{ color: group.color || 'inherit' }} className="collapse-chevron" icon={DropdownChevronRight} iconSize={20} />
                        </ChevronTooltip>
                    </button>
                </div>
            }


            {!isCollapsed &&
                <div
                    className="collapse-chevron-container"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setIsCollapsed(true)}
                    >
                        <ChevronTooltip content="Collapse group">
                            <Icon style={{ color: group.color || 'inherit' }} className="collapse-chevron" icon={DropdownChevronDown} iconSize={20} />
                        </ChevronTooltip>
                    </button>
                </div>
            }
            <div ref={ref}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
                className={cn("group-header-wrapper", isDragging && "dragging")}>
                <EditableHeading onEditModeChange={() => setHeaderColorTrigger(!headerColorTrigger)} ref={headingRef} onChange={(name) => handleChangeName(name)} className={cn("group-header-color group-heading")} type="h3" style={{ color: group.color || 'inherit' }} value={group.name || group._id} />

                <div className="dragable" {...dndProps} style={{ cursor: 'grab' }}></div>

                {!isCollapsed && <Text className="items-count" color='secondary' type="text2" style={{ marginLeft: '8px' }}>{groupCount || "No"} Task{groupCount !== 1 && "s"}</Text>}
            </div>
            {isCollapsed && <Text className="collapse-items" color='secondary' type="text2">{tasksCount} items</Text>}
        </section>

        {isCollapsed && cmpOrder.map(cmp => (
            <div className={`summary-collapsed ${cmp}-summary column-label-${cmp}`}>
                <Text type="text2" className="column-label">{cmp}</Text>
                <DynamicSummary key={cmp + " summery"} cmpType={cmp} group={group} />
            </div>
        ))}
        {isCollapsed && <div {...dndProps} className="summary-collapsed summary-collapsed-filler column-filler">
        </div >}
    </>

})

export default GroupHeader