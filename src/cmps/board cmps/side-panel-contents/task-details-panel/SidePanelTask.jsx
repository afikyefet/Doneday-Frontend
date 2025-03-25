import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SidePanelWrapper from "../SidePanelWrapper";
import SidePanelTaskActivity from "./SidePanelTaskActivity";
import SidePanelTaskContentTabs from "./SidePanelTaskContentTabs";
import SidePanelTaskMessages from "./SidePanelTaskMessages";

const tabs = {
    messages: 0,
    activity: 2,
}

const SidePanelTask = () => {
    const { taskId } = useSelector(storeState => storeState.sidePanelModule.info)
    const [task, setTask] = useState();
    const [currentTab, setCurrentTab] = useState(tabs.messages)
    const board = useSelector(storeState => storeState.boardModule.board)

    useEffect(() => {
        if (taskId && board && board.groups) {
            let foundTask = null;
            for (const group of board.groups) {
                const taskFromGroup = group.tasks.find(task => task._id === taskId);
                if (taskFromGroup) {
                    foundTask = taskFromGroup;
                    break;
                }
            }
            setTask(foundTask);
        } else {
            setTask(null);
        }
    }, [taskId, board]);


    return <SidePanelWrapper
        heading={task?.taskTitle || 'loading...'}
        component={<SidePanelTaskContentTabs onTabChange={setCurrentTab} />}
    >

        {currentTab === tabs.messages && <SidePanelTaskMessages task={task} />}
        {currentTab === tabs.activity && <SidePanelTaskActivity task={task} />}
    </SidePanelWrapper>
}

export default SidePanelTask;