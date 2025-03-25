import { TextField } from "@vibe/core";
import { CloseSmall } from "@vibe/icons";
import React from "react";


export const TextBody = ({ text, setText }) => {


    return (
        <section className="text-body">
            <TextField iconName={text !== "" && CloseSmall} clearOnIconClick={true} autoFocus={true} value={text} onChange={setText} />
        </section>
    );
};

export default TextBody;
