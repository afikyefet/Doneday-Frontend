import { Avatar, Text } from "@vibe/core"
import { useRef } from "react"
import SidePanelRepliesList from "./SidePanelRepliesList"
import SidePanelReplyInput from "./SidePanelReplyInput"
import SidePanelUpdateActions from "./SidePanelUpdateActions"
import SidePanelUpdateMenu from "./SidePanelUpdateMenu"

const SidePanelUpdatePreview = ({ update, onUpdateReply, onRemoveReply }) => {
    const textAreaRef = useRef();

    // When user clicks on reply button, it focuses on the reply input
    const onClickUpdateReply = () => {
        if (textAreaRef.current) {
            textAreaRef.current.focus()
        }
    }

    // When logged user likes an update
    const handleUpdateLike = () => {
        onUpdateLike(update)
    }

    // When logged user replys to an update
    const handleAddReply = (newReply) => {
        const newUpdate = { ...update };
        newUpdate.replies = newUpdate?.replies || [];
        newUpdate.replies.push(newReply);
        onUpdateReply(newUpdate, newReply.text);
    }

    return <article className="update-preview">
        <header className="update-preview-header">
            <div className="update-preview-user">
                {/* <Avatar className="update-preview-avatar" size="large" text={update.by.name[0]} /> */}
                {update.by.avatar && <Avatar className="update-preview-avatar" type="img" size="large" src={update.by.avatar} />}
                {!update.by.avatar && <Avatar className="update-preview-avatar" type="text" size="large" text={update.by.name[0]} />}
                <Text className="update-preview-user-name" type="text1" weight="bold" element="p">{update.by.name}</Text>
                <SidePanelUpdateMenu onDelete={() => onRemoveReply(update._id)} onEdit={() => console.log('edit')} />
            </div>
            <section className="update-preview-contents">
                <Text type="text1" element="p">{update.text}</Text>
            </section>
        </header>
        <SidePanelUpdateActions onUpdateLike={handleUpdateLike} onClickUpdateReply={onClickUpdateReply} />
        <SidePanelRepliesList replies={update.replies} />
        <SidePanelReplyInput ref={textAreaRef} onAddReply={handleAddReply} />
    </article>
}

export default SidePanelUpdatePreview