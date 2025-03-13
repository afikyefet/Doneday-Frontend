
const newB = {
    _id: "board1",
    name: "Board numero uno",
    color: "#339ecd",
    groups: []
}

const newG = {
    _id: "group1",
    name: "Backlog",
    boardId: "board1",
    color: "#339ecd",
    tasks: [{
        _id: "task101",
        groupId: "group1",
        taskTitle: "Design homepage UI",
        members: [
            { name: "Tal", color: "#2a5699" },
            { name: "Avi", color: "#2a5699" }
        ],
        allMembers: [
            { name: "Dor", color: "#2a5699" },
            { name: "Ariel", color: "#e4901c" },
            { name: "Afik", color: "#fb275d" }
        ],
        timeline: { startDate: "", endDate: "" },
        link: "",
        date: "15-01-2025",
        status: "wip",
        priority: "high"
    }]
}

