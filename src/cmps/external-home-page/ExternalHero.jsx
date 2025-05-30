import { Heading, Text } from "@vibe/core";
import ExternalDemoButton from "./ExternalDemoButton";
import ExternalHeroTitle from "./ExternalHeroTitle";
import { userService } from "../../services/user";


const ExternalHero = () => {

    const demoCredentials = [
    { username: 'afik', password: '1234' },
    { username: 'dor', password: '1234' },
    { username: 'ariel', password: '1234' },
]

        const handleLogin = (username) => {
        const credentials = demoCredentials.find(cred => cred.username === username);
        userService.login(credentials)
            .then(() => {
                window.location.reload();
            });
    }

    return (
        <main className="external-hero">
            <div className="external-hero-segment">
                <article className="external-hero-segment-content">
                    <ExternalHeroTitle />
                    <Heading
                        align="center"
                        weight="light"
                        type="h1"
                        className="external-hero-segment-title">
                        Made for work,<br />
                        designed to love
                    </Heading>
                    <Text
                        element="p"
                        color="secondary"
                        align="center"
                        style={{ fontWeight: 300, lineHeight: '160%', fontSize: '1.125rem', maxWidth: '540px', height: '96px' }}>
                        Streamline workflows and gain clear visibility across teams to make strategic decisions with confidence.
                    </Text>
                    <ExternalDemoButton handleLogin={handleLogin} size="large" />
                </article>
            </div>
        </main>
    )
}

export default ExternalHero;