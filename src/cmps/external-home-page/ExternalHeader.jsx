import { Button, Menu, MenuButton, MenuItem } from "@vibe/core";
import { Person } from "@vibe/icons";
import { useEffect, useRef } from "react";
import { userService } from "../../services/user";
import ExternalDemoButton from "./ExternalDemoButton";

const demoCredentials = [
    { username: 'afik', password: '1234' },
    { username: 'dor', password: '1234' },
    { username: 'ariel', password: '1234' },
]

const ExternalHeader = () => {
    const headerRef = useRef()
    const baseDivRef = useRef()

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    headerRef.current.classList.remove("external-header-sticky");
                } else {
                    headerRef.current.classList.add("external-header-sticky");
                }
            });
        });
        observer.observe(baseDivRef.current);
    }, [])

    const handleLogin = (username) => {
        const credentials = demoCredentials.find(cred => cred.username === username);
        userService.login(credentials)
            .then(() => {
                window.location.reload();
            });
    }

    return (
        <>
            <div id="intersection-element" style={{ position: 'absolute', top: '0' }} ref={baseDivRef}></div>
            <header className="external-header" ref={headerRef}>
                <div className="external-header-container">
                    <img src="/img/logo-transparent.png" alt="logo" className="external-header-logo" />
                    <nav className="external-nav">
                        <section className="external-nav-first-menu">

                        </section>
                        <section className="external-nav-other-options">
                            <MenuButton className="external-header-button" triggerElement={props => <Button kind="tertiary" {...props}>Log In</Button>}>
                                <Menu id="login-meun" size={Menu.sizes.MEDIUM}>
                                    <MenuItem icon={Person} onClick={() => handleLogin('afik')} iconType="svg" title="Afik Yefet" />
                                    <MenuItem icon={Person} onClick={() => handleLogin('ariel')} iconType="svg" title="Ariel Aharon" />
                                    <MenuItem icon={Person} onClick={() => handleLogin('dor')} iconType="svg" title="Dor Cohen" />
                                </Menu>
                            </MenuButton>
                            <ExternalDemoButton handleLogin={handleLogin} styles={{ marginLeft: '8px' }} />
                        </section>
                    </nav>
                </div >
            </header >
        </>
    )
}

export default ExternalHeader;