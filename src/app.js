import {Wdg} from "./wdg"
import {Box} from "./box"

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
    static create(fn)
    {
        const self = this;
        Wdg.main(function () {
            var app = new self();
            fn && fn.call(app);
            app.doLayout();
        });
    }
}