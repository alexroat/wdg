import {Wdg} from "./wdg"
import {Container} from "./container"


export class Grid extends Container
{
    constructor(props)
    {
        super(props);
    }
    doLayout()
    {
        const cw = 200, ch = 200;
        const cc = this.children();
        for (var c of cc)
            c.css({position: "absolute", left: (c.props.x || 0) * cw, top: (c.props.y || 0) * ch, width: (c.props.w || 1) * cw, height: (c.props.w || 1) * ch});
        return super.doLayout();
    }
}
