/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const cssSize = /(left|right|top|bottom|width|height|margin|border|padding|size)/i;
function mergeObjs() {
    var r = {};
    for (var o of arguments)
        for (var k in o)
            r[k] = o[k]; return r;
}
;


function mapTouch(ev)
{
    return (ev.changedTouches || [ev])[0];
}


export class Wdg
{
    constructor(props, x)
    {
        this.el = Wdg.getEl(x || "<div/>");
        this.el.__WDG = this;
        this.props = {};
        this.setProps(props);
        this.toggleClass(this.defaultClasses().join(" "), true);
    }
    defaultClasses()
    {
        var o = this;
        const r = [];
        while (o.constructor != Wdg)
        {
            o = Object.getPrototypeOf(o)
            r.push(o.constructor.name)
        }
        return r;
    }
    setProps(props)
    {
        this.props = {...this.props, ...props};
        return this;
    }
    doLayout()
    {
        for (var k of this.el.childNodes || [])
            Wdg.get(k).doLayout();
        return this;
    }
    static getEl(x)
    {
        if (x instanceof Wdg)
            return x.el;
        else if (typeof x === 'string')
            try
            {
                return document.querySelector(x);
            } catch (e)
            {
                var t = document.createElement("div");
                t.innerHTML = x;
                return t.removeChild(t.firstChild);
            }
        return x;
    }
    static get(x, props)
    {
        var el = Wdg.getEl(x);
        if (el)
            return (el.__WDG || new Wdg(props, x)).setProps(props);
    }
    static main(fn)
    {
        document.addEventListener('DOMContentLoaded', fn);
    }
    append(x, props, refresh = false)
    {
        var x = Wdg.get(x, props);
        if (x)
            this.el.appendChild(x.el);
        return refresh ? this.doLayout() : this;
    }
    appendTo(x, props, refresh = false)
    {
        Wdg.get(x).append(this, props, refresh);
        return this;
    }
    remove(refresh = false)
    {
        var p = this.parent();
        this.el.remove();
        if (p && refresh)
            p.doLayout();
        return this;
    }
    mounted()
    {
        return document.body.contains(this.el);
    }
    parent()
    {
        return this.el.parentNode && Wdg.get(this.el.parentNode);
    }
    children(all = false)
    {
        var c = [];
        for (var el of this.el.children || [])
            c.push(Wdg.get(el));
        return c.filter(function (c) {
            return all || !c.props.ignore;
        });
    }
    animate(cb, transition = "all 0.1s linear")
    {
        const self = this;
        this.one("transitionend", function () {
            self.el.style.transition = "";
            cb && cb.call(self);
        });
        this.el.style.transition = transition;
        return this;
    }
    css(s)
    {
        for (var k in s)
            this.el.style[k] = k.match(cssSize) && !isNaN(s[k]) ? s[k] + "px" : s[k];
        return this;
    }
    cssa(style, transition)
    {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.animate(resolve, transition).css(style);
        });
    }
    attr(a)
    {
        for (var k in a)
            this.el.setAttribute(k, a[k]);
        return this;
    }
    text(t)
    {
        if (t === undefined)
            return this.el.textContent;
        this.el.textContent = t;
        return this;
    }
    val(x)
    {
        if (x === undefined)
            return this.el.value;
        this.el.value = x;
        return this;
    }
    isVisible(el) {
        return (this.el.offsetParent !== null)
    }
    toggle(visible)
    {
        if (visible == undefined)
            visible = !this.isVisible();
        this.css({display: visible ? null : "none"});
        return this;
    }
    computedStyle()
    {
        return  window.getComputedStyle(this.el);
    }
    trigger(event, data, opt = {})
    {
        const self = this;
        (event.match(/\S+/g) || []).map(function (e) {
            if (opt.global)
                Wdg.triggerGlobal(e, data);
            else
                self.el.dispatchEvent(new CustomEvent(e, {detail: data}));
        });
        return this;
    }
    static triggerGlobal(event, data)
    {
        (event.match(/\S+/g) || []).map(function (e) {
            [...document.querySelectorAll(`[wdge-${e}]`)].map(function (el) {
                el.dispatchEvent(new CustomEvent(e, {detail: data}));
            });
        });
    }
    one(event, cb, opt = {})
    {
        const self = this;
        function to()
        {
            self.off(event, to);
            self.off(event, cb);
            cb && cb.call(this);
        }
        this.on(event, cb, opt);
        return this.on(event, to, opt);
    }
    on(event, cb, opt = {})
    {
        const self = this;
        event.match(/\S+/g).map(function (e) {
            if (opt.global)
                self.el.setAttribute(`wdge-${event}`, "");
            self.el.addEventListener(e, cb);
        });
        return this;
    }
    off(event, cb)
    {
        var self = this;
        event.match(/\S+/g).map(function (e) {
            self.el.removeEventListener(e, cb);
            ;
        });

        return this;
    }
    removeAll(refresh = false)
    {
        for (var c of this.children())
            c.remove();
        return refresh ? this.doLayout() : this;
    }
    expand()
    {
        return this.css({position: "absolute", left: 0, right: 0, top: 0, bottom: 0});
    }
    static handleResize(w)
    {
        window.addEventListener("resize", function () {
            w.doLayout();
        });
    }
    wrap(x)
    {
        return x.append(this);
    }
    prev()
    {
        return Wdg.get(this.el.previousElementSibling);
    }
    next()
    {
        return Wdg.get(this.el.nextElementSibling);
    }
    toggleClass(cls, force)
    {
        const self = this;
        (cls.match(/\S+/g) || []).map(function (c) {
            self.el.classList.toggle(c, force);
        });
        return this;
    }
    static ajax(p)
    {
        var p = {...p};
        p.method = p.method || "GET";
        p.contentType |= (p.json ? 'application/json' : 'application/x-www-form-urlencoded');
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(p.method, p.url + p.param ? "?" + formEncode(p.param) : "");
            xhr.setRequestHeader('Content-Type', p.contentType);
            xhr.onload = function () {
                var r = {data: xhr.responseText, xhr};
                if (xhr.status !== 200)
                    return reject(r);
                if (p.json)
                    r.data = JSON.parse(r.data);
                return resolve(r);
            };
            switch (p.method)
            {
                case "GET":
                    p.data = "";
                    break;
                case "POST":
                case "PUT":
                    if (p.json)
                        p.data = p.data || JSON.stringify(p.data || p.json);
                    else
                        p.data = formEncode(p.data, "\n");
                    break;
            }
            xhr.send(p.data);
        });
    }
    setMenu(props)
    {
        const self = this;
        this.on("contextmenu", function (ev) {
            ev.preventDefault();
            new Menu({...props, volatile: true, floating: true})
                    .appendTo(self).css({top: ev.pageY - 3, left: ev.pageX - 3});
        });
    }
    getContentSize()
    {
        var el = this.el;
        //var width = el.style.width;
        //var height = el.style.height;
        //this.css({width: 0, height: 0});
        var s = this.getComputedStyle(el);
        var cwidth = el.scrollWidth + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
        var cheight = el.scrollHeight + parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
        //this.css({width, height});
        return {width: cwidth, height: cheight};
    }
    getBounds()
    {
        const {top, right, bottom, left, width, height, x, y} = this.el.getBoundingClientRect();
        return {top, right, bottom, left, width, height, x, y};
    }

    block(toggle, props)
    {
        var block = this.children().filter((c) => (c instanceof Blocking))[0];
        if (toggle && !block)
        {
            return new Blocking(props).appendTo(this, {}, true);
        }
        if (!toggle && block)
        {
            return block.remove();
        }
        return block;
    }
    getComputedStyle()
    {
        return window.getComputedStyle(this.el);
    }
    idrag(fnRef = () => ( {}))
    {
        this.css({"touch-action": "manipulation"});
        const self = this;
        var ref;
        var ev0;
        function delta(ev)
        {
            const t = mapTouch(ev);
            const t0 = mapTouch(ev0);
            return {...ref, deltaX: t.pageX - t0.pageX, deltaY: t.pageY - t0.pageY};
        }
        function mdown(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            ev0 = ev;
            ref = fnRef(ev);
            Wdg.get(window).on("mousemove touchmove", mmove).on("mouseup touchend", mup);
            self.trigger("idragstart idrag", delta(ev));
            return false;
        }
        function mup(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            Wdg.get(window).off("mousemove touchmove", mmove).off("mouseup touchend", mup);
            self.trigger("idragstop idrag", delta(ev));
            return false;
        }
        function mmove(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            self.trigger("idragmove idrag", delta(ev));
            return false;
        }
        self.on("mousedown touchstart", mdown);
        return this;
    }
    setState(state = {})
    {
        const self = this;
        function monitor(obj)
        {
            if (!(obj instanceof Object))
                return obj;
            for (var k in obj)
                obj[k] = monitor(obj[k]);
            return new Proxy(obj, {set: function (o, k, v) {
                    if (o[k] !== v)
                    {
                        o[k] = monitor(v);
                        self.trigger("statechange", self.state);
                    }
                    return true;
                }, deleteProperty: function (o, k) {
                    delete o[k];
                    self.trigger("statechange", self.state);
                    return true;
                }});
        }
        this.state = monitor(state);
        self.trigger("statechange", self.state);
        return this;
    }
    connectState(src, fnMap = (x) => x)
    {
        const self = this;
        src.on("statechange", notify);
        function notify(ev) {
            if (self.mounted())
                self.setState(fnMap(ev.detail));
            else
                src.off("statechange", notify);
        }
        return self.setState(fnMap(src.state));
    }
}


function formEncode(value, separator = "&")
{
    var lo = [];
    function traverse(x, prefix = "")
    {
        if (typeof x == 'object')
            for (var i in x)
                traverse(x[i], prefix ? `${prefix}[${i}]` : i)
        else
            lo.push([x, prefix]);
    }
    traverse(value);
    return lo.map(([x, prefix]) => (encodeURIComponent(prefix) + "=" + encodeURIComponent(x))).join(separator);
}

class Container extends Wdg
{
    constructor(props, x)
    {
        super(props, x)
    }
}

class SingleContainer extends Container
{
    constructor(props, x)
    {
        super(props, x)
    }

    setCurrent(x)
    {
        for (var c of this.children())
            c.props.active = (c === x)
        this.doLayout();
    }
    getPrev()
    {
        const cc = this.children();
        const i = cc.indexOf(this.getCurrent());
        if (cc.length)
            return cc[(i + cc.length - 1) % cc.length];
    }
    getNext()
    {
        const cc = this.children();
        const i = cc.indexOf(this.getCurrent());
        if (cc.length)
            return cc[(i + 1) % cc.length];
    }
    setPrev()
    {
        return this.setCurrent(this.getPrev());
    }
    setNext()
    {
        return this.setCurrent(this.getNext());
    }
    getCurrent(x)
    {
        for (var c of this.children())
            if (c.props.active)
                return c;
    }

    doLayout()
    {
        const cc = this.children();
        if (!this.props.nocurrent && !this.getCurrent() && cc.length)
            this.setCurrent(cc[0]);
        for (var c of cc)
            c.expand().expand().toggle(c.props.active || false);
        if (this.getCurrent())
            this.getCurrent().doLayout();
        return this;
    }
}


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
            return c.props.w || 0;
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
                c.animate(delegate(function (c) {
                    c.doLayout();
                }, c)).css({left: 0, right: 0, top: o, height: w});
            o += w;
        }
        return super.doLayout();
    }
}

function delegate(fn, x)
{
    return function ()
    {
        return fn(x);
    }
}
;


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
        const pick = function (c) {
            return function () {
                if (self.parent().props.nocurrent && self.getCurrent() === c)
                    c = null;
                self.setCurrent(c);
            }
        };
        this.removeAll();
        for (var c of this.getItems())
            new Wdg({}, "<span/>").text(c.props.title || c.constructor.name).appendTo(this).on("click", pick(c)).toggleClass("active", c.props.active || false);
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


export class App extends  Box
{
    constructor(props)
    {
        super(props, "body");
        this.state = {};
        this.expand().removeAll();
        Wdg.handleResize(this);
    }
    static get()
    {
        return Wdg.get("body");
    }
}

function randomColor() {
    var str = (parseInt(0xffffff * Math.random())).toString(16);
    str = "0".repeat(6 - str.length) + str;
    return "#" + str;
}

export class ColoredBox extends Box
{
    constructor(props)
    {
        super(props);
        this.css({background: randomColor()});
    }
}



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

export class Blocking extends Wdg
{
    constructor(props)
    {
        super({...props, ignore: true});
        const self = this;
        this.expand().css({background: "black", background: "#000000c0"});
        this.on("click", function (ev) {
            if (ev.target == self.el)
                self.remove();
        });
    }
}



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

function whichEdge(ev, el, extra = 0)
{
    var ev = mapTouch(ev);
    var el = el || ev.src;
    const bcr = el.getBoundingClientRect();
    const x = ev.clientX - bcr.x;
    const y = ev.clientY - bcr.y;
    const style = window.getComputedStyle(el);
    const bleft = parseFloat(style.borderLeftWidth) + extra
    const btop = parseFloat(style.borderTopWidth) + extra
    const bright = bcr.width - parseFloat(style.borderRightWidth) - extra
    const bbottom = bcr.height - parseFloat(style.borderBottomWidth) - extra

    const ht = el.offsetWidth - parseFloat(style.borderRightWidth) - parseFloat(style.borderLeftWidth);
    const vt = el.offsetHeight - parseFloat(style.borderBottomWidth) - parseFloat(style.borderTopWidth);
    switch (true)
    {
        case x <= bleft && y <= btop:
            return "NW";
        case x <= bleft && y > bbottom:
            return "SW";
        case x > bright && y > bbottom:
            return "SE";
        case x > bright && y <= btop:
            return "NE";
        case y <= btop:
            return "N";
        case x <= bleft:
            return "W";
        case y > bbottom:
            return "S";
        case x > bright:
            return "E";
        default:
            return undefined;
}
}


export class TableRow extends Wdg
{
    constructor(props)
    {
        super(props, document.createElement("tr"));
    }
}

export class TableCell extends Wdg
{
    constructor(props)
    {
        var props = {...props};
        super(props, document.createElement(props.header ? "th" : "td"));
        const self = this;
        const extraMargin = 3;
        this.on("mousemove", function (ev) {
            const edge = whichEdge(ev, self.el, extraMargin);
            self.css({cursor: {"E": "ew-resize", "S": "ns-resize"}[edge] || "default"});
        }).on("idrag", function (ev) {
            const {offsetWidth, offsetHeight, edge, deltaX, deltaY} = ev.detail;
            if (edge)
            {
                if (edge == "E")
                    self.css({width: offsetWidth + deltaX});
                if (edge == "S")
                    self.css({height: offsetHeight + deltaY});
            }
        }).idrag(function (ev) {
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight} = self.el;
            return {offsetWidth, offsetHeight, edge: whichEdge(ev, self.el, extraMargin)};
        });

    }
}

export class Table extends Wdg
{
    constructor(props)
    {
        super(props, "<table><thead/><tbody/></table>");
        this.head = Wdg.get(this.el.tHead);
        this.body = Wdg.get(this.el.tBodies[0]);
        var tr = new TableRow().appendTo(this.head)
        for (var j = 0; j < 10; j++)
            new TableCell({header: 1}).appendTo(tr).text(j).css({position: "sticky",
                top: 0});
        for (var i = 0; i < 100; i++)
        {
            var tr = new TableRow().appendTo(this.body)
            for (var j = 0; j < 10; j++)
                new TableCell().appendTo(tr).text(i + "," + j);
        }

    }
}


export class Input extends Wdg
{
    constructor(props, tag = "<input/>")
    {
        super(props, tag)
    }
    doLayout()
    {
        this.text(this.props.title)
        return this;
    }
}



export class Select extends Input
{
    constructor(props)
    {
        super(props, "<select/>")
    }
}

export class TextArea extends Input
{
    constructor(props)
    {
        super(props, "<textarea/>")
    }
}

export class Button extends Input
{
    constructor(props)
    {
        super(props, "<button/>")
    }

}


export class Form extends Wdg
{
    constructor(props)
    {
        super(props)
    }

    build(def)
    {
        var r = new Wdg("<fieldset/>")
        switch (def.type)
        {
            case "object":
                for (var d in def.items)
                    r.append(build(d));
                break;
            case "list":
                for (var d in def.items)
                    r.append(build(d));
                break;
            case "text":
                new Wdg("<input/>").appendTo(r)
                break;
            case "number":
                new Wdg("<input/>").appendTo(r)
                break;
            case "check":
                new Wdg("<input/>").appendTo(r)
                break;
            case "radio":
                for (var d in def.items)
                    new Wdg("<input/>").appendTo(r)
                break;
            case "select":
                var s = new Wdg("<input/>").appendTo(r)
                for (var d in def.items)
                    new Wdg("<item/>").appendTo(r)

        }
        return r;
    }

}


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

export class Carousel extends SingleContainer
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.btnPrev = new Wdg({ignore: true}, "<span/>").attr({id: "prev"}).text("<").on("click", function () {
            self.setPrev();
        }).appendTo(this);
        this.btnNext = new Wdg({ignore: true}, "<span/>").attr({id: "next"}).text(">").on("click", function () {
            self.setNext();
        }).appendTo(this);
    }
    setPrev()
    {
        const self = this;
        const p = self.getPrev();
        const c = self.getCurrent();
        const s = this.el.clientWidth;
        p.props.active = true;
        self.doLayout()
        p.css({transform: "translate(" + -s + "px, 0px)"});
        setTimeout(function () {
            c.animate(function () {
                self.setCurrent(p);
            }).css({transform: "translate(" + s + "px, 0px)"});
            p.animate().css({transform: ""})
        }, 0);
    }
    setNext()
    {
        const self = this;
        const p = self.getNext();
        const c = self.getCurrent();
        const s = this.el.clientWidth;
        p.props.active = true;
        self.doLayout()
        p.css({transform: "translate(" + s + "px, 0px)"});
        setTimeout(function () {
            c.animate(function () {
                self.setCurrent(p);
            }).css({transform: "translate(" + -s + "px, 0px)"});
            p.animate().css({transform: ""})
        }, 0);
    }
    doLayout()
    {
        this.css({overflow: "hidden"})
        const top = (this.el.offsetHeight - this.btnPrev.el.offsetHeight) / 2;
        this.btnPrev.css({position: "absolute", top, left: 0});
        this.btnNext.css({position: "absolute", top, right: 0});
        super.doLayout();
    }

}
