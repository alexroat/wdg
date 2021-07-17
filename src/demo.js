/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import {Wdg, Box, App, Container, TabbedView, Splitter, ColoredBox, Menu, Tree, Dialog, Table, Grid, Carousel, SideBar, SingleContainer, Icon, PageMock,randomText} from './index';





import "./demo.css";




export class DemoMenu extends ColoredBox
{
    constructor(props)
    {
        super(props);
        this.setMenu({items: [{title: "ciao"}, {title: "miao", action: [{title: "pippo"}, {title: "pluto"}, {title: "paperino"}]}, {title: "bau", action: [{title: "ying"}, {title: "yang"}]}]});
    }
}

export class DemoModal extends ColoredBox
{
    constructor(props)
    {
        super(props)


        this.on("click", async function () {

            var t = window.hhh = new Dialog();
            console.log(await t.showModal())
        })

    }
}

export class DemoTable extends Table
{
    constructor(props)
    {
        super(props)
        this.setData([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    }
}

export class DemoGrid extends Grid
{
    constructor(props)
    {
        super(props);

        for (var i = 0; i < 5; i++)
            for (var j = 0; j < 5; j++)
                new ColoredBox({x: j, y: i}).appendTo(this);
    }
}


export class DemoCarousel extends Carousel
{
    constructor(props)
    {
        super(props)

        for (var i = 0; i < 5; i++)
            new PageMock().appendTo(this);
    }
}

export class DemoSplitter extends Box
{
    constructor(props)
    {
        super(props)

        var top = new PageMock().appendTo(this, {w: 50});
        new Splitter().appendTo(this);
        var bottom = new Box({horizontal: true}).appendTo(this, {p: 1});
        new PageMock().appendTo(bottom, {w: 50});
        new Splitter().appendTo(bottom);
        new PageMock().appendTo(bottom, {p: 1});
    }

}

export class Demo extends App
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.sidebar = new SideBar().appendTo(this);
        this.header = new Icon({icon: "bars"}).appendTo(this, {w: 30}).on("click", function () {
            self.sidebar.toggle();
        });
        this.main = new TabbedView().appendTo(this, {p: 1});
        this.footer = new TabbedView().appendTo(this, {nocurrent: true});
        new ColoredBox().appendTo(this.footer).text(randomText());
        new ColoredBox().appendTo(this.footer).text(randomText());
        new ColoredBox().appendTo(this.footer).text(randomText());

        this.addContentAction(ColoredBox)
        this.addContentAction(PageMock)
        this.addContentAction(DemoCarousel)
        this.addContentAction(DemoSplitter)
        this.addContentAction(DemoMenu)
        this.addContentAction(DemoModal)
        this.addContentAction(DemoTable)
        this.addContentAction(DemoGrid)
    }
    addContentAction(klass)
    {
        const self = this;
        const l = new Wdg().text(klass.name).on("click", function () {
            self.main.setCurrent(new klass());
            self.sidebar.toggle();
        }).appendTo(this.sidebar, {p: 1});
    }
}