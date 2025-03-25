import { Button, Dialog, DialogContentContainer, Icon } from "@vibe/core";
import { Search } from "@vibe/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { setFilterBy } from "../../../store/actions/board.actions";
import TextBody from "./TextBody";
import TextHeader from "./TextHeader";

export function BoardText() {
    const filterByText = useSelector((storeState) => storeState.boardModule.filterBy.text);

    // Initialize text – add a unique id if missing
    const [text, setText] = useState("")

    const isTextActive = filterByText !== ""

    useEffect(() => {
        setFilterBy({ text })

    }, [text]);

    return (
        <section className="board-text">
            <Dialog
                position="bottom-start"
                showTrigger={["click"]}
                hideTrigger={["clickoutside", 'click']}
                content={
                    <DialogContentContainer style={{ padding: "0px" }}>
                        <section className="text-dialog">
                            <TextHeader title="Search" />
                            <TextBody
                                text={text}
                                setText={setText}
                            />
                        </section>
                    </DialogContentContainer>
                }
            >
                <Button
                    className={`icon-button text-btn ${isTextActive ? "active" : ""}`}
                    size="small"
                    ariaLabel="Search"
                    kind="tertiary"
                >
                    <Icon iconSize={20} icon={Search} /> Search
                </Button>
            </Dialog>
        </section>
    );
}
