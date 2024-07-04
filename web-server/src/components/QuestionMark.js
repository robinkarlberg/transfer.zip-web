import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function QuestionMark({ placement, children }) {
    const renderTooltip = (props) => {
        return (
            <Tooltip className="border rounded" {...props}>
                {children}
            </Tooltip>
        )
    }

    return (
        <OverlayTrigger placement={placement || "bottom"} overlay={renderTooltip}>
            <i className="ms-1 bi bi-question-circle"></i>
        </OverlayTrigger>
    )
}