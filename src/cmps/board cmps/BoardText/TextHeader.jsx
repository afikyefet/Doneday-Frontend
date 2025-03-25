import { Text } from "@vibe/core";
import React from "react";

const TextHeader = ({ title }) => {
    return (
        <section className="text-header">
            <Text type="text1" weight="medium">
                {title}
            </Text>
        </section>
    );
};

export default TextHeader;
