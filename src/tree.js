import {Wdg} from "./wdg"

export class TreeItem extends Wdg
{
    constructor(props)
    {
        super(props);

    }
    doLayout()
    {
        const self = this;
        this.removeAll();
        this.label = new Wdg().text(this.props.title || "Node").appendTo(this).on("click", function () {
            self.toggle();
        }).css({cursor: "pointer"});
        if (!this.props.collapsed)
            for (var i of this.props.items || [])
                new TreeItem(i).appendTo(this).css({padding: 5});
        return super.doLayout();
    }
    toggle()
    {
        this.props.collapsed = !this.props.collapsed;
        this.doLayout();
    }
}

export class Tree extends TreeItem
{
    constructor(props)
    {
        super(props);
    }
}
