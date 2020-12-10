import {Wdg} from "./wdg"
import {SingleContainer} from "./container"


export class ParentItemPicker
{
    constructor(props)
    {

    }
}

export class ChildPicker extends Wdg
{
    constructor(props)
    {
        super({...props, ignore: true})
    }

    getItems()
    {
        var p = this.parent();
        if (p)
            return p.children();
    }
    getCurrent()
    {
        var p = this.parent();
        if (p)
            return p.getCurrent();
    }
    setCurrent(c)
    {
        var p = this.parent();
        if (p)
            return p.setCurrent(c);
    }
}

class TabLabel extends Wdg
{
    constructor(props, c)
    {
        super(props)
        const self = this;
        this.text(c.props.title || c.constructor.name).on("click", function () {
            const container = self.parent().parent();
            container.animate(function () {
                self.doLayout();
            }).setCurrent(container.props.nocurrent && container.getCurrent() == c ? null : c)
        }).toggleClass("active", c.props.active || false);
    }

}

export class TabHeader extends ChildPicker
{
    constructor(props)
    {
        super(props)
    }
    doLayout()
    {
        const self = this;
        this.css({position: "absolute", left: 0, right: 0});
        this.removeAll();
        for (var c of this.getItems())
            new TabLabel({}, c).appendTo(this);
        return super.doLayout()
    }

}

export class MobileTabHeader extends ChildPicker
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.css({position: "absolute", left: 0, right: 0});
        this.label = new Wdg("<span/>").appendTo(this).on("click", function () {
            self.list.toggle();
        }).text("---");
        this.list = new Wdg().toggleClass("itemlist").appendTo(this).toggle(false).css({position: "absolute", height: 200, bottom: -200, left: 0, right: 0});
    }
    doLayout()
    {
        const self = this;
        const pick = function (c) {
            return function () {
                self.setCurrent(c);
                self.list.toggle(false);
            }
        };
        const cur = this.getCurrent();
        this.label.text(cur ? cur.props.title || cur.constructor.name : "---");
        this.list.removeAll();
        for (var c of this.getItems())
            new Wdg().text(c.props.title || c.constructor.name).appendTo(this.list).on("click", pick(c)).toggleClass("active", c.props.active || false);
        return super.doLayout()
    }
}

export class TabbedView extends SingleContainer
{
    constructor(props)
    {
        super(props)
        this.header = new TabHeader().appendTo(this);
    }
    doLayout()
    {
        //test responsiveness
        const hc = this.el.clientWidth < 200 ? MobileTabHeader : TabHeader;
        if (!(this.header instanceof hc))
            this.header.remove(), this.header = new hc().appendTo(this);

        this.header.doLayout();
        const w = this.getCurrent() ? this.props.wexpanded || 150 : this.header.el.offsetHeight;
        if (this.props.w !== w)
        {
            this.props.w = w;
            this.parent().doLayout();
        }
        super.doLayout();
        const cur = this.getCurrent();
        if (cur)
            cur.css({top: this.header.el.offsetHeight}).doLayout();
        return this;
    }
}

