import { useSelector } from "react-redux"
import DynamicSummary from "./DynamicSummary"
import GroupColumnFiller from "./GroupColumnFillter"
import GroupScrollableColumns from "./GroupScrollableColumns"



const GroupSummaryRow = ({ group, isCollapsed }) => {
    const cmpOrder = useSelector(state => state.boardModule.cmpOrder)

    return <section className="summary-row-wrapper">
        {!isCollapsed && <div className="spacer-div summery-white"></div>}
        <div className="summary-row">
            <GroupScrollableColumns last={true}>
                {cmpOrder.map(cmp => <DynamicSummary key={cmp + " summery"} cmpType={cmp} group={group} />)}
            </GroupScrollableColumns>
        </div>
        <GroupColumnFiller />
    </section>
}

export default GroupSummaryRow