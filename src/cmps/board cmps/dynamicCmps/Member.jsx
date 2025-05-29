/* eslint-disable react/prop-types */
import {
    Avatar,
    AvatarGroup,
    Button,
    Dialog,
    DialogContentContainer,
    Icon,
    IconButton,
    Text,
} from "@vibe/core";
import { Add, Search } from "@vibe/icons";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { debounce } from "../../../services/util.service";

export function Member({ info, onTaskUpdate }) {
    const allMembers = useSelector(state => state.boardModule.members)
    const board = useSelector(state => state.boardModule.board)
    const [infoState, setInfoState] = useState(info);
    const [allAvailableMembers, setAllAvailableMembers] = useState([]);
    const [isAddButtonVisible, setIsAddButtonVisible] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        setAllAvailableMembers(allMembers.filter(member => !info.some(infoMember => infoMember._id === member._id)))
    }, [allMembers, board])

    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedMembers([]);
    };

    const onAddMembers = (newMembers) => {
        onTaskUpdate(newMembers);
    };

    const handleMouseChanges = (status) => {
        setIsAddButtonVisible(status);
        if (!status) closeDialog();
    };

    const debouncedUpdate = useMemo(
        () =>
            debounce((value) => {
                setDebouncedSearchTerm(value);
            }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedUpdate(value);
    };

    const handleRemoveMember = (memberId) => {
        const updatedInfo = infoState.filter((member) => member._id !== memberId);
        const memberToRemove = infoState.find((member) => member._id === memberId);

        if (memberToRemove) {
            const originalMember = allMembers.find(m => m._id === memberId);

            if (originalMember) {
                const filtered = allAvailableMembers.filter(m => m._id !== memberId);

                setAllAvailableMembers([
                    ...filtered,
                    { ...originalMember }
                ]);

                setInfoState(updatedInfo);
                setSelectedMembers(prev => prev.filter(id => id !== memberId));
                onTaskUpdate(updatedInfo);
            }
        }
    };

    const toggleMemberSelection = (memberId, isCtrlPressed) => {
        const updatedMembers = isCtrlPressed
            ? selectedMembers.includes(memberId)
                ? selectedMembers.filter((id) => id !== memberId)
                : [...selectedMembers, memberId]
            : selectedMembers.includes(memberId)
                ? []
                : [memberId];

        setSelectedMembers(updatedMembers);

        if (!isCtrlPressed) {
            updateServiceWithMembers(updatedMembers);
        }
    };

    const updateServiceWithMembers = (newMemberIds) => {
        if (!newMemberIds.length) {
            return;
        }

        const memberPool = [...allMembers, ...allAvailableMembers];

        const structuredMembers = newMemberIds.map(newMemberId => {
            const memberSet = new Set(memberPool.map(m => JSON.stringify(m)));
            const members = Array.from(memberSet).map(m => JSON.parse(m));

            const member = members.find(m => m._id === newMemberId);
            return member ? member : null;
        }).filter(Boolean);

        if (!newMemberIds.length) {
            // alert("No member data found.");
            return;
        }

        const updatedInfo = [...infoState, ...structuredMembers];

        const updatedAllAvailableMembers = allAvailableMembers.filter(
            member => !newMemberIds.includes(member._id)
        );

        setInfoState(updatedInfo);
        setAllAvailableMembers(updatedAllAvailableMembers);
        onAddMembers(updatedInfo);
    };

    const filteredMembers = (allAvailableMembers ? allAvailableMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
            !infoState.some((infoMember) => infoMember._id === member._id)
    ) : '');

    const avatarMax = infoState.length > 3 ? 3 : infoState.length;

    return (
        <div
            className="column-label-members default-cell-color"
            style={{ width: "100%" }}
            onMouseEnter={() => handleMouseChanges(true)}
            onMouseLeave={() => handleMouseChanges(false)}
        >
            {isDialogOpen && (
                <Dialog
                    showTrigger={[]}
                    onClose={closeDialog}
                    title="Add Members"
                    position="top"
                    isOpen
                    zIndex="999"
                    className="dialogMembers"
                >
                    <DialogContentContainer
                        className="addMemberDialog"
                        size={DialogContentContainer.sizes.LARGE}
                        type="modal"
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                marginBottom: "20px",
                            }}
                        >
                            {infoState && infoState.length > 0 && infoState.map((member) => (
                                <div
                                    key={member.name}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor: "#f0f4ff",
                                        borderRadius: "20px",
                                        padding: "0",
                                        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
                                        fontSize: "12px",
                                        color: "#333",
                                    }}
                                >
                                    <button
                                        onClick={() => handleRemoveMember(member._id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            background: "none",
                                            border: "none",
                                            padding: "0",
                                            cursor: "pointer",
                                        }}
                                        aria-label={`Remove ${member.name}`}
                                    >
                                        {member.imgUrl && <Avatar
                                            type="img"
                                            src={member.imgUrl}
                                            ariaLabel={member.name}
                                            size="small"
                                        />}
                                        {!member.imgUrl && <Avatar
                                            type="text"
                                            text={member.name.substring(0, 1)}
                                            backgroundColor={member?.color || "black"}
                                            ariaLabel={member.name}
                                            size="small"
                                        />}
                                    </button>
                                    <span style={{ margin: "0 8px" }}>{member.name}</span>
                                    <button
                                        onClick={() => handleRemoveMember(member._id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#999",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                        }}
                                        aria-label={`Remove ${member.name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "1rem",
                            }}
                        >
                            <Icon
                                icon={Search}
                                iconLabel="Search"
                                style={{ marginRight: "8px", color: "#888" }}
                            />
                            <input
                                type="text"
                                placeholder="Search members based on their name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd",
                                }}
                            />
                        </div>
                        <Text type="text2" weight="light" style={{ marginBottom: "5px" }}>
                            Suggested People
                        </Text>
                        <AvatarGroup size="medium">
                            {filteredMembers.length > 0 &&
                                filteredMembers.map((member) => (
                                    <Button
                                        key={member._id}
                                        kind={
                                            selectedMembers.includes(member._id)
                                                ? "primary"
                                                : "tertiary"
                                        }
                                        style={{
                                            flex: "0 1 100%",
                                            justifyContent: "left",
                                        }}
                                        onClick={(e) =>
                                            toggleMemberSelection(
                                                member._id,
                                                e.ctrlKey || e.metaKey
                                            )
                                        }
                                    >
                                        <div
                                            key={member.name}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: "0",
                                                color: "#000",
                                            }}
                                        >
                                            {member.imgUrl && <Avatar
                                                key={member.name}
                                                type="img"
                                                src={member.imgUrl}
                                                ariaLabel={member.name}
                                                size="small"
                                            />}
                                            {!member.imgUrl && <Avatar
                                                key={member.name}
                                                type="text"
                                                text={member.name.substring(0, 1)}
                                                backgroundColor={
                                                    member?.color ? member.color : "black"
                                                }
                                                ariaLabel={member.name}
                                                size="small"
                                            />}
                                            <span style={{ marginLeft: "5px" }}>
                                                {member.name}
                                            </span>
                                        </div>
                                    </Button>
                                ))}
                        </AvatarGroup>
                    </DialogContentContainer>
                </Dialog>
            )}
            <div className="avatars">
                {allAvailableMembers &&
                    isAddButtonVisible && (
                        <IconButton
                            className="addMembers"
                            iconClassName="addMembersIcon"
                            iconLabel="Add Members"
                            size="xxs"
                            onClick={openDialog}
                        >
                            <Add />
                        </IconButton>
                    )}
                {(infoState?.length === 1 && !infoState[0].imgUrl) &&
                    <Avatar
                        key={infoState[0].name}
                        type="text"
                        size="small"
                        text={infoState[0].name.substring(0, 1)}
                        backgroundColor={
                            infoState[0]?.color ? infoState[0].color : "black"
                        }
                        ariaLabel={infoState[0].name}
                    />
                }
                {(infoState?.length === 1 && infoState[0].imgUrl) &&
                    <Avatar
                        key={infoState[0].name}
                        type="img"
                        size="small"
                        src={infoState[0].imgUrl}
                        ariaLabel={infoState[0].name}
                    />
                }
                {infoState?.length > 1 && <AvatarGroup
                    size="small"
                    max={avatarMax}
                    counterProps={{
                        ariaLabelItemsName: "teams",
                    }}
                >
                    {infoState.map((member) => {
                        if (member.imgUrl) {
                            return <Avatar
                                key={member.name}
                                type="img"
                                src={member.imgUrl}
                                backgroundColor={
                                    member?.color ? member.color : "black"
                                }
                                ariaLabel={member.name}
                            />
                        } else if (!member.imgUrl) {
                            return <Avatar
                                key={member.name}
                                type="text"
                                text={member.name.substring(0, 1)}
                                backgroundColor={
                                    member?.color ? member.color : "black"
                                }
                                ariaLabel={member.name}
                            />
                        }
                    })}
                </AvatarGroup>
                }
                {infoState?.length === 0 && <img src="https://cdn.monday.com/icons/dapulse-person-column.svg" width={24} height={24} />}
            </div>
        </div>
    );
}
