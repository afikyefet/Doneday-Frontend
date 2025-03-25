import { DndContext, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext } from "@dnd-kit/sortable"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { setBoard, updateBoard } from "../../store/actions/board.actions"
import { AddGroup } from "./structure/AddGroup"
import GroupContainer from "./structure/GroupContainer"

export function BoardDetails() {
    const board = useSelector(storeState => storeState.boardModule.board)
    const selectedTasks = useSelector(storeState => storeState.taskSelectModule.selectedTasks ?? [])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(MouseSensor),
        useSensor(TouchSensor),
    )

    const onDragEnd = (dragEvent) => {
        const { active, over } = dragEvent
        if (!over || !active || active.id === over.id) return

        const updatedBoard = { ...board }

        const oldIndex = updatedBoard.groups.findIndex(group => group._id === active.id)
        const newIndex = updatedBoard.groups.findIndex(group => group._id === over.id)

        updatedBoard.groups = arrayMove(updatedBoard.groups, oldIndex, newIndex)

        setBoard(updatedBoard)
        updateBoard(updatedBoard)
    }

    const boardGroupIds = useMemo(() => board.groups.map(g => g._id), [board])

    if (!board || !board.groups) return null
    return (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <section className="board-details">
                <SortableContext items={boardGroupIds}>
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
            </section>
        </DndContext>
    )
}