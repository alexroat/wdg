import {Wdg} from "./wdg"
import {SingleContainer} from "./container"
import {whichEdge} from "./utils"
import {ColoredBox} from "./box"


export class Dialog extends SingleContainer
{
    constructor(props)
    {
        super({...props, ignore: true});
        const self = this;
        this.css({position: "absolute", width: 100, height: 100, left: 100, top: 100});
        this.css({border: "3px solid lightgray"});
        this.header = new Wdg({ignore: true}).text(this.props.title || this.constructor.name).appendTo(this).css({background: "lightgrey", border: "1px solid grey", cursor: "default"});
        new Wdg({}, "<span/>").text("X").appendTo(this.header).on("click", function (ev) {
            ev.stopPropagation();
            self.close("OK");
            return false;
        });
        new ColoredBox().appendTo(this, {p: 1});
        this.idrag(function (ev) {
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight} = self.el;
            return {offsetLeft, offsetWidth, offsetTop, offsetHeight, edge: whichEdge(ev, self.el)};
        }).on("idrag", function (ev) {
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight, edge, deltaX, deltaY} = ev.detail;
            if (edge)
            {
                if (edge.indexOf("N") >= 0)
                    self.css({top: offsetTop + deltaY, height: offsetHeight - deltaY});
                if (edge.indexOf("S") >= 0)
                    self.css({height: offsetHeight + deltaY});
                if (edge.indexOf("W") >= 0)
                    self.css({left: offsetLeft + deltaX, width: offsetWidth - deltaX});
                if (edge.indexOf("E") >= 0)
                    self.css({width: offsetWidth + deltaX});
                self.doLayout();
            } else
                self.css({left: offsetLeft + deltaX, top: offsetTop + deltaY});


        });
        this.on("mousemove", function (ev) {
            const edge = whichEdge(ev, self.el);
            self.css({cursor: edge ? edge.toLowerCase() + "-resize" : "default"});
        });
    }

    close(value)
    {
        return this.trigger("close", value).remove();
    }

    showModal()
    {

        const self = this;
        const target = this.parent() || Wdg.get("body");
        const block = target.block(true);
        block.append(this, {}, true);

        return new Promise(function (resolve, reject) {
            self.on("close", (e) => {
                target.block(false);
                resolve(e.detail)
            });
        });
    }
    doLayout()
    {
        super.doLayout();
        const cur = this.getCurrent();
        if (cur)
            cur.css({top: this.header.el.offsetHeight}).doLayout();
    }
}