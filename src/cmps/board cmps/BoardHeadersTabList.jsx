import { Flex, Tab, TabList, Text } from "@vibe/core"
import { Chart, Home } from "@vibe/icons"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const BoardHeadersTabList = () => {
    const currentBoard = useSelector(state => state.boardModule.board);
    const navigate = useNavigate();
    const location = useLocation();

    // Very simple path check - just look for /chart at the end
    const isChartView = location.pathname.endsWith('/chart');

    // Compute URLs
    const baseUrl = currentBoard?._id ? `/board/${currentBoard._id}` : '/';
    const chartURL = `${baseUrl}/chart`;

    // Handle tab change
    const handleTabChange = (index) => {
        if (index === 0) {
            navigate(baseUrl);
        } else if (index === 1) {
            navigate(chartURL);
        }
    };

    // Log values for debugging
    // if (import.meta.env.DEV) {
    //     console.log('Current path:', location.pathname);
    //     console.log('Is chart view:', isChartView);
    //     console.log('Active index:', isChartView ? 1 : 0);
    // }

    return (
        <Flex className="tabs" flexGrow={1} justify="center" style={{ marginTop: '8px' }}>
            <TabList
                size="sm"
                className="tablist"
                activeTabId={isChartView ? 1 : 0}
                onTabChange={handleTabChange}
            >
                <Tab icon={Home} className="single-tab">
                    <Text type="text2">Main Table</Text>
                </Tab>
                <Tab icon={Chart} className="single-tab">
                    <Text type="text2">Chart</Text>
                </Tab>
            </TabList>
        </Flex>
    );
}

export default BoardHeadersTabList