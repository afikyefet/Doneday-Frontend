import { Heading } from "@vibe/core";
import { CloseMedium } from "@vibe/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CLEAR_PAGE_INFO } from "../../../store/reducers/sidePanel.reducer";

const SidePanelWrapper = ({ children, heading, component, resetUrl = '/' }) => {
    const currentBoard = useSelector(state => state.boardModule.board);
    const closingURL = currentBoard?._id ? `/board/${currentBoard._id}` : resetUrl;
    const dispatch = useDispatch();
    const closePage = () => dispatch({ type: CLEAR_PAGE_INFO });

    return <section className="side-panel-contents-wrapper">
        <header className="side-panel-header">
            <div className="side-panel-closing-bar side-padding">
                <Link to={closingURL} onClick={closePage}>
                    <CloseMedium size={16} />
                </Link>
            </div>
            {heading && <Heading className="side-panel-heading side-padding" ellipsis={false} type="h2">{heading}</Heading>}
            {component}
        </header>
        <section role="main" className="side-panel-contents">
            {children}
        </section>

    </section>
}

export default SidePanelWrapper;