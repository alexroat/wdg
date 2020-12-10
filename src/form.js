import {Wdg} from "./wdg"



export class Form extends Wdg
{
    constructor(props)
    {
        super(props)
    }

    build(def)
    {
        var r = new Html.FieldSet;
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
                new Html.Input.appendTo(r)
                break;
            case "number":
                new Html.Input.appendTo(r)
                break;
            case "check":
                new Html.Input.appendTo(r)
                break;
            case "radio":
                for (var d in def.items)
                    new Html.Input.appendTo(r)
                break;
            case "select":
                var s = new Html.Input.appendTo(r)
                for (var d in def.items)
                    new Html.Item.appendTo(r)

        }
        return r;
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