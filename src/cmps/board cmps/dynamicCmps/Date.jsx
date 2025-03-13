import { Button, DatePicker, Dialog, DialogContentContainer, Link } from "@vibe/core"
import moment from "moment"

export function Date({ info, onTaskUpdate }) {

    const dateValue = moment.isMoment(info) ? info : moment(info, "DD-MM-YYYY")


    function formatTaskDate() {
        const date = moment(info, "DD-MM-YYYY")
        if (!date.isValid()) {
            return ""
        }
        const currentYear = moment().year()
        if (date.year() === currentYear) {
            return date.format("MMM D")
        }
        return date.format("MMM D YYYY")
    }

    const handleClick = (e) => {
        e.preventDefault()
    }

    function taskTest(d) {
        console.log(d);
        // onTaskUpdate(d)
    }

    return (<div className="column-label column-label-date default-cell-color">

        <Dialog
            // modifiers={modifiers}
            position="bottom"
            showTrigger={['click']}
            hideTrigger={['clickoutside']}
            content={
                <DialogContentContainer>
                    <DatePicker
                        date={dateValue}
                        onPickDate={(date) => console.log(date)}
                    />
                </DialogContentContainer>
            }
        >
            <Link
                text={formatTaskDate()}
                onClick={(e) => handleClick(e)}
            />
        </Dialog>
    </div>)
}