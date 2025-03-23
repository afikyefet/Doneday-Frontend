import { Heading, Text } from "@vibe/core"

const SidePanelNoUpdates = () => {
    return <section className="no-updates">
        <img src="https://microfrontends.monday.com/mf-feed/latest/static/media/empty-state.8bf98d52.svg" alt="No updates" />
        <Heading type="h3" weight="bold">No updates yet for this item</Heading>
        <Text
            element="p"
            type="text1"
            weight="medium"
            style={{ fontSize: '1.1em', maxWidth: '500px' }}
            align="center"
        >
            Be the first one to update about progress, mention someone or upload files to share with your team members
        </Text>
    </section>
}

export default SidePanelNoUpdates