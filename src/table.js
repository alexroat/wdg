import {whichEdge, Wdg, Box, TableBox, Splitter, Icon, TabbedView, ToolBar, ToolBarButton, Html, FloatingAction, FullScreenButton} from "./wdg"


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
        this.doLayout();
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
    }
    doLayout()
    {
        //this.refresh();
        return super.doLayout();
    }
}


export class DataTable extends Table
{
    constructor(props)
    {
        super(props);
        const self = this;
        this.sorts = [];
        this.filters = [];
        this.mods = new Set();
        this.setData({cols: [{name: "a"}, {name: "b"}], rows: [{a: 1, b: 2}, {a: 3, b: 4}]});
        this.toolbar = new ToolBar().prependTo(this, {w: 30});
        this.btnLoad = new ToolBarButton({icon: "sync", action: () => self.load()}).appendTo(this.toolbar)
        this.btnSave = new ToolBarButton({icon: "save", action: () => self.save()}).appendTo(this.toolbar)
    }
    clear()
    {
        this.body.removeAll();
        this.head.removeAll();
    }
    setData(data)
    {
        this.rows = data.rows;
        this.cols = data.cols;
        for (var i in this.rows)
            this.rows[i]._ = {i};
        this.refresh();
    }
    refresh()
    {
        const self = this;
        this.clear();
        const trhead = new Html.Tr().appendTo(this.head);
        self.formatColRowHead(new Html.Th().appendTo(trhead));
        for (var col of this.cols)
            self.formatColHead(new Html.Th({col}).appendTo(trhead));
        for (var row of this.rows)
        {
            var tr = new Html.Tr({row}).appendTo(this.body);
            self.formatRowHead(new Html.Th({row}).appendTo(tr));
            for (var col of this.cols)
                (col.fmtCell || DataTable.fmtCell)(new Html.Td({row, col}).appendTo(tr), row[col.name], col, row, this);
        }
        this.doLayout();
    }
    setSort(name, mode, append)
    {
        if (!append)
            this.sorts = [];
        this.sorts.push({name, mode});
        this.refresh();
    }
    getSort(name)
    {
        var mode;
        this.sorts.forEach((x) => {
            if (x.name == name)
                mode = x.mode
        })
        return mode;
    }

    static fmtCell(c, val, col, row, table)
    {
        const x=val == null ? "" : val
        c.removeAll();
        if (table.props.edit)
        {
            const itype = {}[col.type]
            const i = new Html.Input().val(x).appendTo(c)
            i.on("change", () => {
                row[col.name] = i.val();
                row._.modified = 1;
            })
            switch (true)
            {
                case col.type == "DECIMAL":
                case col.type == "INTEGER":
                    case col.type == "NUMERIC":
                    i.attr({"type": "number"});
                    break;
                case col.type == "DATETIME":
                    i.attr({"type": "datetime-local"}).val(x.slice(0, -1))
                    break;
                case col.type == "DATE":
                    i.attr({"type": "date"}).val(x.slice(0, -1))
                    break;
            }
        } else
            new Html.Div().text(x).appendTo(c)
    }
    formatCell(c)
    {
        const fnDisplay = () => new Html.Input().val(val)
        const fnEdit = () => new Html.Div().text(val)
        const {row, col} = c.props;
        const self = this;
        const val = row[col.name]
        c.removeAll();
        c.append(this.props.edit ? fnDisplay() : fnEdit())
    }
    formatColHead(c)
    {
        c.removeAll();
        this.setResizable(c)
        const {col} = c.props;
        c.text(col.name);
        c.append(new Sorter());
    }
    formatRowHead(c)
    {
        this.setResizable(c)
        const {row} = c.props;
        c.text(row._.i);
    }
    formatColRowHead(c)
    {
        this.setResizable(c)
    }
    async load()
    {

    }
    async save()
    {

    }
    setResizable(cell)
    {
        const self = this;
        cell.on("mousemove", function (ev) {
            const edge = whichEdge(ev, cell.el, 5);
            self.css({cursor: {"E": "ew-resize", "S": "ns-resize"}[edge] || "default"});
        }).on("idrag", function (ev) {
            const {offsetWidth, offsetHeight, edge, deltaX, deltaY, tableWidth, tableHeight} = ev.detail;
            if (edge)
            {
                if (edge == "E")
                {
                    const idx = cell.index();
                    var w = offsetWidth + deltaX
                    for (var tr of self.head.children())
                        tr.children()[idx].css({"max-width": w, "min-width": w});
                }
                if (edge == "S")
                    cell.parent().css({"height": offsetHeight + deltaY});
            }
        }).idrag(function (ev) {
            const table = self.table.el;
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight} = cell.el;
            const edge = whichEdge(ev, cell.el, 5);
            if (edge == "E" || edge == "S")
                return {offsetWidth, offsetHeight, edge, tableWidth: table.scrollWidth, tableHeight: table.offsetHeight};
        });
    }
}

class Sorter extends Html.Span
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.on("click", function () {
            self.toggleSort();
        })
    }
    doLayout()
    {
        const table = this.parent(DataTable);
        const col = this.parent(Html.th).props.col;
        this.removeAll();
        this.icon = new Icon({icon: ({asc: "sort-up", desc: "sort-down"}[table.getSort(col.name)]) || "sort"}).appendTo(this);
    }
    toggleSort()
    {
        const col = this.parent(Html.th).props.col;
        const table = this.parent(DataTable);
        table.setSort(col.name, {asc: "desc", desc: "", "": "asc"}[table.getSort(col.name) || ""], false);
        table.load();
    }
}

class LockButton extends ToolBarButton
{
    constructor(props)
    {
        super({icon: "lock", ...props})
        const self = this;
        this.props.action = () => {
            const dt = self.parent(DataTable);
            dt.props.edit ^= 1;
            dt.refresh()
        };
    }
    doLayout()
    {
        this.props.icon = this.parent(DataTable).props.edit ? "unlock" : "lock"
        return super.doLayout();
    }
}

class Pager extends Html.Span
{
    constructor(props)
    {
        super(props)
        const self = this;
        new Html.Span().text("rows:").appendTo(this);
        this.lblCount = new Html.Input().css({width: "4ch"}).text("0").appendTo(this);
        new Html.Span().text("page:").appendTo(this);
        this.lblPage = new Html.Input().css({width: "4ch"}).text("0").appendTo(this)
        new Html.Span().text("of").appendTo(this);
        this.lblPageCount = new Html.Input().css({width: "4ch"}).text("0").appendTo(this)
        this.btnBegin = new ToolBarButton({icon: "fast-backward", action: () => self.getTarget().goBegin()}).appendTo(this)
        this.btnPrev = new ToolBarButton({icon: "step-backward", action: () => self.getTarget().goPrev()}).appendTo(this)
        this.btnNext = new ToolBarButton({icon: "step-forward", action: () => self.getTarget().goNext()}).appendTo(this)
        this.btnEnd = new ToolBarButton({icon: "fast-forward", action: () => self.getTarget().goEnd()}).appendTo(this)
    }
    getTarget()
    {
        return this.props.target || this.parent(DataTable);
    }
    doLayout()
    {
        const self = this;
        const target = self.getTarget();
        this.lblCount.val(target.props.count);
        this.lblPage.val(target.props.page);
        this.lblPageCount.val(target.pageCount());
        return super.doLayout();
    }
}


export class PagedDataTable extends DataTable
{
    constructor(props)
    {
        super({pageSize: 10, page: 0, count: 0, limit: 0, ...props});
        this.pager = new Pager().appendTo(this.toolbar);
        new LockButton().appendTo(this.toolbar);
    }
    pageCount()
    {
        return Math.ceil(this.props.count / this.props.limit);
    }
    async goPrev()
    {
        this.props.page--;
        return this.load()
    }
    async goNext()
    {
        this.props.page++;
        return this.load()
    }
    async goBegin()
    {
        this.props.page = 0;
        return this.load()
    }
    async goEnd()
    {
        this.props.page = this.pageCount() - 1;
        return this.load()
    }
}