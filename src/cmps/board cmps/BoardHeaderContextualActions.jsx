import { Flex, MenuItem, SplitButton, SplitButtonMenu } from "@vibe/core"
import { Group } from "@vibe/icons"
import { BoardFilter } from "./BoardFilter/BoardFilter"
import { BoardPerson } from "./BoardPerson/BoardPerson"
import { BoardSort } from "./BoardSort/BoardSort"
import { BoardText } from "./BoardText/BoardText"

const BoardHeaderContextualActions = ({ onAddGroup, onAddTask }) => {
    return <Flex className="action" gap="small" align="center">
        <SplitButton children="New task"
            size="small"
            dialogPaddingSize="small"
            onClick={onAddTask}
            secondaryDialogContent={
                <SplitButtonMenu id="split-menu">
                    <MenuItem onClick={onAddGroup} icon={Group} title="New group of tasks" />
                </SplitButtonMenu>
            }
        />
        <BoardText />
        <BoardPerson />
        <BoardFilter />

        <BoardSort />
    </Flex>
}

export default BoardHeaderContextualActions