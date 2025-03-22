import { List, ListItem, MenuTitle } from "@vibe/core";
import React from "react";

const FilterColumn = ({ title, options, toggleFilterBy, filterBy, countTasksByFilter }) => {

    const activeOptions = options.filter(
        (option) =>
            filterBy[title] && filterBy[title].includes(option.value)
    );
    const inactiveOptions = options.filter(
        (option) =>
            !filterBy[title] || !filterBy[title].includes(option.value)
    );

    function getDotStyle(value) {
        // Define the mapping for status colors
        const statusColors = {
            draft: "#c4c4c4",
            done: "#00c875",
            wip: "#fdab3d",
            stuck: "#df2f4a",
            onhold: "#ff007f",
            revision: "#007eb5",
            design: "#9d50dd",
        };

        // Define the mapping for priority colors
        const priorityColors = {
            low: "#579bfc",
            medium: "#5559df",
            high: "#401694",
            critical: "#333333",
            tbd: "#c4c4c4",
        };

        // Define the mapping for member colors
        const memberColors = {
            Dor: "#2a5699",
            Ariel: "#e4901c",
            Afik: "#fb275d",
        };

        // Check for the value in each mapping
        if (value in statusColors) {
            return { backgroundColor: statusColors[value] };
        }
        if (value in priorityColors) {
            return { backgroundColor: priorityColors[value] };
        }
        if (value in memberColors) {
            return { backgroundColor: memberColors[value] };
        }

        // Fallback if the value is not found
        return { backgroundColor: "#ccc" };
    }

    return (
        <section className="filter-column">
            <List>
                <MenuTitle
                    className="filter-column-title"
                    type="h3"
                    weight="medium"
                    caption={title}
                />
                {activeOptions.map((option, idx) => (
                    <ListItem onClick={() => toggleFilterBy(title, option.value)} key={idx} className="filter-item active" kind='secondary' size="small">
                        <div className="dot" style={getDotStyle(option.value)}></div>
                        <snap className="filter-label">{option.label}</snap>
                        <span className="filter-amount">{countTasksByFilter(title, option.value)}</span>
                    </ListItem>
                ))}
                {inactiveOptions.map((option, idx) => (
                    <ListItem onClick={() => toggleFilterBy(title, option.value)} key={idx} className="filter-item" kind='secondary' size="small">
                        <div className="dot" style={getDotStyle(option.value)}></div>
                        <snap className="filter-label">{option.label}</snap>
                        <span className="filter-amount">{countTasksByFilter(title, option.value)}</span>
                    </ListItem>
                ))}
            </List>
        </section>
    );
};

export default FilterColumn;