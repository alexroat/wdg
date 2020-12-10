import { Wdg, Html} from "./wdg"
import { Box } from "./box"
import {whichEdge} from "./utils"

export class Table extends Box
{
    constructor(props)
    {
        super(props);
        this.table = new Html.Table();
        this.table.appendTo(this, {p: 1}).expand();
        this.head = new Html.THead().appendTo(this.table);
        this.body = new Html.Tbody().appendTo(this.table);
        this.data = [];
    }
    clear()
    {
        this.body.removeAll();
        this.head.removeAll();
    }
    setData(data)
    {
        this.data = data;
        this.refresh();
    }
    refresh()
    {
        this.clear();
        for (var i in this.data)
        {
            var tr = new Html.Tr().appendTo(this.body)
            for (var j in this.data[i])
                var td = new Html.Td().appendTo(tr).text(i + "," + j)
        }
        this.doLayout();
    }
}

class NumericInput extends Html.Input
{
    constructor(props)
    {
        super(props)
        this.attr({type: "number"})
    }
}

class DateInput extends Html.Input
{
    constructor(props)
    {
        super(props)
        this.attr({type: "date"})
    }
    val(x)
    {
        if (x == undefined)
            return this.el.value + "Z";
        else
            this.el.value = x.slice(0, -1)
        return this;
    }
}

class DateTimeInput extends DateInput
{
    constructor(props)
    {
        super(props)
        this.attr({type: "datetime-local"})
    }
}



