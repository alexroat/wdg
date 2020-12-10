import {Wdg} from "./wdg"



export class Icon extends Wdg
{
    constructor(props)
    {
        super(typeof (props) === "string" ? {icon: props} : props, "<i/>");
        this.setIcon(this.props.icon);
    }
    getIconClass(icon)
    {
        return "fas fa-" + icon;
    }
    setIcon(icon)
    {
        this.toggleClass(this.getIconClass(this.props.icon), false)
        this.props.icon = icon;
        this.toggleClass(this.getIconClass(this.props.icon), true)
        return this.doLayout();
    }

}
