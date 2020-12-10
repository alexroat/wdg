import {Wdg,Container, randomImg, randomInt, randomText} from "./all";


export class ToggleMock extends Wdg
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

export class PageMock extends Container
{
    constructor(props)
    {
        super(props);

        var nSections = randomInt(3, 10);
        for (var s = 0; s < nSections; s++)
        {
            new Wdg({}, "<h2/>").text(randomText(4, 12)).appendTo(this);
            new ToggleMock().appendTo(this);
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
