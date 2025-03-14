import { Button, DatePicker, Dialog, DialogContentContainer, Icon, Link } from "@vibe/core"
import { Calendar } from "@vibe/icons"
import moment from "moment"

export function Date({ info, onTaskUpdate }) {

    const dateValue = moment.isMoment(info)
    //  ? info : moment(info, "DD-MM-YYYY")


    function formatTaskDate() {
        const date = moment(info, "DD-MM-YYYY")
        if (!date.isValid()) {
            return ""
        }
        const currentYear = moment().year()
        if (date.year() === currentYear) {
            return date.format("MMM D")
        }
        return date.format("MMM D, YYYY")
    }

    const handleClick = (e) => {
        e.preventDefault()
    }

    function onDateReset() {
        handlePickDate('')
    }

    const handlePickDate = (newDate) => {
        // Format the new date in the same "DD-MM-YYYY" format
        const formattedDate = newDate.format("DD-MM-YYYY");
        // Call the update function with the formatted date.
        onTaskUpdate(formattedDate);
    };

    const noDateIcons = (<Icon icon={Calendar} />)

    return (<div className="column-label column-label-date default-cell-color">

        <Dialog
            // modifiers={modifiers}
            position="bottom"
            showTrigger={['click']}
            hideTrigger={['clickoutside']}
            content={
                <DialogContentContainer>
                    <Button onClick={() => handlePickDate}>Today</Button>
                    <DatePicker
                        date={dateValue}
                        onPickDate={handlePickDate}
                    />
                </DialogContentContainer>
            }
        ><section onClick={(e) => handleClick(e)} className="date-picker-window">
                <Link
                    text={info ? formatTaskDate() : (noDateIcons)}

                />
                {/* {info === '' && <Link
                    text={formatTaskDate()}
                    onClick={(e) => handleClick(e)}
                />} */}
            </section>
        </Dialog>
    </div>)
}