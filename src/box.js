import {Wdg} from "./wdg"
import {Container} from "./container"
import {randomColor} from "./utils"

export class Box extends Container
{
    constructor(props, x)
    {
        super(props, x);
        this.css({position: "relative"});
    }
    doLayout()
    {
        const self = this;
        function getW(c)
        {
            return c.props.w == "auto" ? (self.props.horizontal ? c.el.scrollWidth : c.el.scrollHeight) : c.props.w || 0;
        }
        var cc = this.children();
        var ih = this.el.clientHeight;
        var iw = this.el.clientWidth;
        var wt;
        if (this.props.horizontal)
            wt = iw;
        else
            wt = ih;
        var pt = 0;
        var o = 0;
        for (var c of cc)
        {
            c.css(c.props.horizontal ? {width: null} : {height: null});
            wt -= getW(c);
            pt += c.props.p || 0;
        }
        pt = pt || 1;
        for (var c of cc)
        {
            var w = getW(c) + wt * (c.props.p || 0) / pt;
            c.css({position: "absolute", "box-sizing": "border-box"});
            if (this.props.horizontal)
                c.css({top: 0, bottom: 0, left: o, width: w});
            else
                c.css({left: 0, right: 0, top: o, height: w});
            o += w;
        }
        return super.doLayout();
    }
}


export class Splitter extends Wdg
{
    constructor(props, x)
    {
        super(props, x);

        var self = this;
        this.props.w = this.props.w || 10;
        this.css({background: "grey"});
        this.idrag(function () {
            return {t0: self.prev(),
                t1: self.next(),
                w0: self.prev().props.w,
                w1: self.next().props.w,
                p: self.parent()};
        }).on("idrag", function (ev) {
            const {t0, t1, w0, w1, p, deltaX, deltaY} = ev.detail;
            const delta = p.props.horizontal ? deltaX : deltaY;
            if (w0)
                t0.props.w = w0 + delta;
            if (w1)
                t1.props.w = w1 + -delta;
            ev.stopPropagation();
            p.doLayout();
        });
    }
    doLayout()
    {
        this.css({cursor: this.parent().props.horizontal ? 'ew-resize' : 'ns-resize'});
        return super.doLayout();
    }
}


export class ColoredBox extends Box
{
    constructor(props)
    {
        super(props);
        this.css({background: randomColor()});
    }
}