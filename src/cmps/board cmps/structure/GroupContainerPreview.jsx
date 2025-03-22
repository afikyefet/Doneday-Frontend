import React, { useState } from "react";
import GroupHeader from "./GroupHeader";
const GroupContainerPreview = ({ group }) => {
    console.log(group);

    const [isCollapsed, setIsCollapsed] = useState(true);

    return <section type='group' className="group-container" role="rowgroup">
        <section role="rowheader" className="group-header-container"
        >
            <div className="group-title-container">
                {isCollapsed && (
                    <div
                        className="pre-collapsed-filler"
                    ></div>
                )}
                <GroupHeader
                    group={group}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            </div>
        </section>
        <div className="ghost-div"></div>
    </section >
}

export default GroupContainerPreview
