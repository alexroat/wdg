

import {cssSize,mergeObjs,mapTouch} from "./utils"

import {Menu} from "./all"




export class Wdg
{
    constructor(props, x)
    {
        this.el = Wdg.getEl(x || "<div/>");
        this.el.__WDG = this;
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
        this.props = {...this.props, ...props}
        //this.trigger("propschange",this.props)
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
    constains(x)
    {
        return this.el.contains(Wdg.get(x).el);
    }
    find(q)
    {
        if (q.prototype instanceof Wdg)
            return [...this.el.querySelectorAll("*")].map((e) => Wdg.get(e)).filter((w) => w instanceof q)
        return [...this.el.querySelectorAll(q)].map((e) => Wdg.get(e))
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
    prepend(x, props, refresh = false)
    {
        var x = Wdg.get(x, props);
        if (x)
            this.el.insertBefore(x.el, this.el.firstChild);
        return refresh ? this.doLayout() : this;
    }
    prependTo(x, props, refresh = false)
    {
        Wdg.get(x).prepend(this, props, refresh);
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
    parent(klass)
    {
        var p = Wdg.get(this.el.parentNode);
        while (klass && p && !(p instanceof klass))
            p = Wdg.get(p.el.parentNode)
        return p;
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
    index()
    {
        return this.parent().children().indexOf(this);
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
            this.el.style[k] = s[k] != null && k.match(cssSize) && !isNaN(s[k]) ? s[k] + "px" : s[k];
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
        if (!arguments.length)
            return this.el.textContent;
        this.el.textContent = t;
        return this;
    }
    val(x)
    {
        if (!arguments.length)
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
        function to(ev)
        {
            self.off(event, to);
            cb && cb.call(this);
        }
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
    empty()
    {
        this.el.innerHTML = "";
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
    wrap(x = new Wdg())
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
    hasClass(cls)
    {
        return this.el.classList.contains(cls);
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
        p.contentType = p.contentType || (p.json ? 'application/json' : 'application/x-www-form-urlencoded');
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(p.method, p.url + (p.param ? "?" + formEncode(p.param) : ""));
            xhr.setRequestHeader('Content-Type', p.contentType);
            xhr.onload = function () {
                var r = {data: xhr.responseText, xhr};
                if (xhr.status !== 200)
                    return reject(r);
                if (p.json)
                    r.data = r.data == undefined || r.data == "" ? undefined : JSON.parse(r.data);
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
        const wnd = Wdg.get(window)
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
            ref = fnRef(ev);
            if (ref === undefined)
                return
            self.toggleClass("idrag", true)
            ev.preventDefault();
            ev.stopPropagation();
            ev0 = ev;
            wnd.on("mousemove touchmove", mmove).on("mouseup touchend", mup);
            self.trigger("idragstart idrag", delta(ev));
            return false;
        }
        function mup(ev)
        {
            self.toggleClass("idrag", false)
            ev.preventDefault();
            ev.stopPropagation();
            wnd.off("mousemove touchmove", mmove).off("mouseup touchend", mup);
            self.trigger("idragstop idrag", delta(ev));
            return false;
        }
        function mmove(ev)
        {
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
    toggleDoubletapZoom(enable = true)
    {
        const self = this;
        function tapzoom(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            self.toggleFullscreen();
            return false;
        }
        if (enable)
            self.on("dblclick", tapzoom)
    }
    toggleFullscreen(enable)
    {
        const self = this;
        self.animate(function () {
            self.doLayout()
        }, "all 0.4s linear").toggleClass("fullscreen", enable);
        return this;
    }
    isFullscreen()
    {
        return this.hasClass("fullscreen");
    }
}





export const Html = new Proxy({}, {
    get: function (target, tag) {
        var tag = tag.toLowerCase( )
        if (target[tag])
            return target[tag];
        var HtmlComponent;
        target[tag] = HtmlComponent = class extends Wdg {
            constructor(props)
            {
                super(props, document.createElement(tag.toLowerCase( )))
            }
        };
        Object.defineProperty(target[tag], 'name', {value: tag});
        return HtmlComponent;
    }});


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





