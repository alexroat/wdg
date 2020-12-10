import {Wdg} from "./wdg"
import {Box} from "./box"
import {Icon} from "./icons"

export class SideBar extends Box
{
    constructor(props)
    {
        super({...props, ignore: true})
        const self = this;
        this.expand().css({width: 0, right: null});
        new Icon("chevron-left").appendTo(this).on("click", function () {
            self.toggle();
        });
    }
    toggle()
    {
        this.props.opened = !this.props.opened;
        this.doLayout();
    }

    doLayout()
    {
        if (this.props.opened && !this.el.offsetWidth)
            this.animate().css({width: this.props.wexpanded || 200});
        if (!this.props.opened && this.el.offsetWidth)
            this.animate().css({width: 0});
    }

}
