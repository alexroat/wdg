import {Wdg,Html} from "./wdg"
import {Icon} from "./icons"        

export class FloatingAction extends Html.Div
{
    constructor(props)
    {
        super({ignore: true, props})
        this.css({right: 50, bottom: 50});
    }
}

export class ToolBarButton extends Html.Button
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.on("click", () => self.props.action());
        //this.doLayout();
    }
    setIcon(icon)
    {
        this.props.icon = icon;
        return this.doLayout();
    }
    doLayout()
    {
        this.removeAll();
        this.icon = new Icon(this.props.icon).appendTo(this);
        return this;
    }
}

export class FullScreenButton extends ToolBarButton
{
    constructor(props)
    {
        super({icon: "expand", ...props})
        const self = this;
        this.props.action = function () {
            const target = self.props.target || self.parent();
            if (target)
                target.toggleFullscreen();
            self.doLayout();
        }
    }
    doLayout()
    {
        const target = this.props.target || this.parent();
        if (target)
            this.props.icon = target.isFullscreen() ? "compress" : "expand";
        return super.doLayout();
    }
}


