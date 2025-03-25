import { cn } from "../../../services/util.service"

const GroupColumnFiller = ({ borders = false, last = false }) => {
    return <div className={cn("column-filler", "full", borders && " top-bottom-border", last && "last-summary")}></div>
}

export default GroupColumnFiller