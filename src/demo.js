/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import {Wdg, Box, App, Container, TabbedView, Splitter, ColoredBox, Menu, Tree, Dialog, Table, Grid, Carousel, SideBar, SingleContainer,Icon} from './wdg';

import "./demo.css"

        function randomInt(min, max)
        {
            if (max == undefined)
                max = min, min = 0;
            return min + parseInt(Math.random() * (max - min));
        }

function randomText(n = 50, min = 1, max = 10, set = "abcdefghijklmnopqrstuvwxyz")
{
    var r = "";
    for (var i = 0; i < n; i++)
    {
        var nw = randomInt(min, max);
        for (var j = 0; j < nw; j++)
            r += set[randomInt(set.length)]
        r += " ";
    }
    return r;
}

function randomImg(w, h)
{
    return "https://picsum.photos/" + w + "/" + h + "/?k=" + Math.random();
}


class PageMock extends Container
{
    constructor(props)
    {
        super(props);

        var nSections = randomInt(3, 10);
        for (var s = 0; s < nSections; s++)
        {
            new Wdg({}, "<h2/>").text(randomText(4, 12)).appendTo(this);
            new MyStupidToggle().appendTo(this);
            var nsi = randomInt(2, 5);
            for (var n = 0; n < nsi; n++)
            {
                var nPars = randomInt(1, 4);
                for (var p = 0; p < nPars; p++)
                    new Wdg({}, "<p/>").text(randomText()).appendTo(this).css({padding: 5});
                new Wdg({}, "<img/>").attr({src: randomImg(300, 200)}).appendTo(this);
            }

        }
    }
}

class MyStupidToggle extends Wdg
{
    constructor(props)
    {
        super(props, "<span/>")
        const self = this;
        this.css({padding: 10, border: "1px solid grey", cursor: "pointer"})
        this.on("click", function () {
            self.props.switch = !self.props.switch;
            self.doLayout()
        });
    }
    doLayout()
    {
        this.css({background: this.props.switch ? "green" : "yellow"}).text(this.props.switch ? "ON" : "OFF")
    }
}

class DemoCarousel extends Carousel
{
    constructor(props)
    {
        super(props)

        for (var i = 0; i < 5; i++)
            new PageMock().appendTo(this);
    }
}

class DemoSplitter extends Box
{
    constructor(props)
    {
        super(props)

        var top = new PageMock().appendTo(this,{w:50});
        new Splitter().appendTo(this);
        var bottom = new Box({horizontal: true}).appendTo(this,{p:1});
        new PageMock().appendTo(bottom,{w:50});
        new Splitter().appendTo(bottom);
        new PageMock().appendTo(bottom,{p:1});
    }

}

export class Demo extends App
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.sidebar = new SideBar().appendTo(this);
        this.header = new Icon({},"bars").appendTo(this, {w: 30}).on("click", function () {
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