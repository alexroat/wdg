import {Wdg,Box} from './all'


export class MenuItem extends Wdg
{
    constructor(props)
    {
        super(props);
        const self = this;
        this.css({cursor: "pointer", border: "1px solid darkgrey", background: "lightgrey", padding: "3px", "min-width": 50});
        this.text(props.title);
        if (Array.isArray(props.action))
        {
            var submenu;
            this.on("mouseenter", function () {
                var b = self.getBounds();
                submenu = new Menu({items: props.action, volatile: true, floating: true})
                        .appendTo(self);
                if (self.props.openVertically)
                    submenu.css({top: b.y + b.height, left: b.x})
                else
                    submenu.css({top: b.y, left: b.x + b.width})
            }).on("mouseleave", function () {
                if (submenu)
                {
                    submenu.remove();
                    submenu = undefined;
                }
            });
        }
    }
}

export class Menu extends Box
{
    constructor(props)
    {
        super(props);
        const self = this;
        this.css({"z-index": 1000});
        const pos = {x: 0, y: 0, left: 0, top: 0, bottom: 0, width: 0, height: 0, ...this.props.pos};
        for (var i of this.props.items)
            new MenuItem(i).appendTo(this, {openVertically: this.props.horizontal}).css({display: this.props.horizontal ? "inline-block" : "block"});
        if (props.floating)
            this.css({position: "fixed", display: "inline-block", padding: 3});
        if (this.props.volatile)
            this.on("mouseleave", function () {
                self.remove();
            });
    }
}