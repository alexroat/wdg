import {Wdg} from "./wdg"
import {SingleContainer} from "./container"


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

