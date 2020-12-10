import {Wdg} from "./wdg"

export class Container extends Wdg
{
    constructor(props, x)
    {
        super(props, x)
    }
}

export class SingleContainer extends Container
{
    constructor(props, x)
    {
        super(props, x)
    }

    setCurrent(x)
    {
        if (x && this.children().indexOf(x) < 0)
            this.append(x);
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

