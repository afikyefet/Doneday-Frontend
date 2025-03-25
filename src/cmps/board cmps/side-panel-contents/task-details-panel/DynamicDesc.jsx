import { Reply, Update } from "@vibe/icons";

export const DynamicDesc = ({ type }) => {
    console.log("🚀 ~ DynamicDesc ~ type:", type)
    let cmp;
    switch (type) {
        case 'reply':
            cmp = <div className="dynamic-desc-title"><Reply size={15} /> Replied</div>
            break;
        case 'comment':
            cmp = <div className="dynamic-desc-title"><Update size={15} /> Commented</div>
            break;
    }

    return <>{cmp}</>
}