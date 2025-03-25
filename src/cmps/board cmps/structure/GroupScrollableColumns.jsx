import GroupColumnFiller from "./GroupColumnFillter"


const GroupScrollableColumns = ({ children, bottomBorder = false, last = false }) => {

    return <section className={`group-scrollable-columns table-row-layout ${bottomBorder && " bottom-border"}`}>
        {children}
        <GroupColumnFiller last={last} />
    </section >
}

export default GroupScrollableColumns