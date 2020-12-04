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

class RowHeaderCell extends Html.Th
{
    constructor(props)
    {
        super(props)
        const self = this;

        this.on("idrag", function (ev) {
            const {offsetWidth, offsetHeight, edge, deltaX, deltaY} = ev.detail;
            if (edge.indexOf("S") >= 0)
            {
                self.parent().css({"height": offsetHeight + deltaY});
            }
        }).idrag(function (ev) {
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight} = self.el;
            const edge = whichEdge(ev, self.el, 5) || "";
            if (edge.indexOf("S") >= 0)
                return {offsetWidth, offsetHeight, edge};
        });
    }
    doLayout()
    {
        const {table, row} = this.props;
        this.text(row[""].i)
        if (row[""].op)
            new Icon({icon: {UPDATE: "asterisk", CREATE: "plus", DELETE: "times"}[row[""].op]}).appendTo(this)
        return super.doLayout();
    }
}

class ColHeaderCell extends Html.Th
{
    constructor(props)
    {
        super(props)
        new Html.Span().text(this.props.col.name).appendTo(this);
        new Sorter().appendTo(this);
        const self = this;
        this.on("idrag", function (ev) {
            const {offsetWidth, offsetHeight, edge, deltaX, deltaY} = ev.detail;
            if (edge.indexOf("E") >= 0)
            {
                var w = offsetWidth + deltaX
                self.css({"max-width": w, "min-width": w});
            }
        }).idrag(function (ev) {
            const {offsetLeft, offsetWidth, offsetTop, offsetHeight} = self.el;
            const edge = whichEdge(ev, self.el, 5) || "";
            if (edge.indexOf("E") >= 0)
                return {offsetWidth, offsetHeight, edge};
        });
    }
}

class Cell extends Html.Td
{
    constructor(props)
    {
        super(props)
        const {row, col, table} = this.props;
        Cell.fmtCell.call(this)
        this.text("")
    }
    doLayout()
    {
        const fnf = this.props.col.fmtCell || Cell.fmtCell
        if (!this.el.contains(document.activeElement))
            fnf.call(this);
        return super.doLayout();
    }
    static fmtCell()
    {
        const self = this;
        const {row, col, table} = this.props;
        var val = row[col.name]
        val = val == null ? "" : val;
        this.removeAll()
        if (table.props.edit)
        {
            const cl = ({
                "DECIMAL": NumericInput,
                "INTEGER": NumericInput,
                "NUMERIC": NumericInput,
                "DATE": DateInput,
                "DATETIME": DateTimeInput,
            })[col.type] || Html.Input;
            const i = new cl().appendTo(this).val(val);
            i.on("change", (e) => {
                e.stopPropagation()
                row[col.name] = i.val();
                if (row[""].op != "CREATE")
                {
                    row[""].op = "UPDATE";
                    table.mods[JSON.stringify(row[""].k)] = row;
                }
                self.parent(Row).doLayout();
                return false;
            });

        } else
            new Html.Span().text(val).appendTo(this)
    }
}

class Row extends Html.Tr
{
    constructor(props)
    {
        super(props)
        const {table} = this.props,
        self = this;
        this.on("click", function (e) {
            e.stopPropagation()
            table.setCurrentRow(self);
            return false;
        })
    }
    isCurrent()
    {
        return this.props.table.current == this.props.row[""].k;
    }
    doLayout()
    {
        this.toggleClass("current", this.isCurrent());
        return super.doLayout()
    }
}

export class DataTable extends Table
{
    constructor(props)
    {
        super({pageSize: 10, page: 0, count: 0, limit: 0, ...props});

        const self = this;
        this.pk = [];
        this.sorts = [];
        this.filters = [];
        this.mods = {};
        this.current = null;
        this.setData({cols: [{name: "a"}, {name: "b"}], rows: [{a: 1, b: 2}, {a: 3, b: 4}]});
        this.toolbar = new ToolBar().prependTo(this, {w: 30});
        this.pager = new Pager().appendTo(this.toolbar);
        this.btnLoad = new LockButton().appendTo(this.toolbar);
        this.btnLoad = new ToolBarButton({icon: "sync", action: () => {
                self.mods = {};
                self.load();
            }}).appendTo(this.toolbar)
        this.btnSave = new ToolBarButton({icon: "save", action: () => self.save()}).appendTo(this.toolbar)
        this.btnAddRow = new ToolBarButton({icon: "file", action: () => self.createRow()}).appendTo(this.toolbar)
        this.btnDeleteRow = new ToolBarButton({icon: "trash", action: () => self.deleteRow()}).appendTo(this.toolbar)
        this.btnDuplicateRow = new ToolBarButton({icon: "copy", action: () => self.duplicateRow()}).appendTo(this.toolbar)
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
        for (var row of this.rows)
            row[""] = {k: this.getKeys(row)};
        this.refresh();
    }
    newRows()
    {
        return Object.values(this.mods).filter((r) => r[""].op == "CREATE");
    }
    refresh()
    {
        const {pageSize, page} = this.props;
        const self = this;
        const table = this;
        this.clear();
        const trhead = new Row({row: {"": {}}, table}).appendTo(this.head);
        new Html.Th().appendTo(trhead);
        for (var col of this.cols)
            new ColHeaderCell({col, table}).appendTo(trhead);
        const drows = this.rows.concat(this.newRows())
        var i = page * pageSize;
        for (var row of drows)
        {
            row[""].i = i++;
            const mrow = this.mods[JSON.stringify(row[""].k)]
            if (mrow)
                row = mrow;
            var tr = new Row({row, table}).appendTo(this.body);
            new RowHeaderCell({row, table}).appendTo(tr);
            for (var col of this.cols)
                new Cell({row, col, table}).appendTo(tr);
        }
        this.setCurrentRow();
        this.doLayout();
    }
    setCurrentRow(tr = this.getCurrentRow())
    {
        this.current = tr.props.row[""].k;
        return this.doLayout();
    }
    getCurrentRow()
    {
        const cc = this.body.children()
        for (var tr of cc)
            if (tr.isCurrent())
                return tr;
        return cc.length ? cc[0] : null;
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
    getKeys(row, op)
    {
        this.pk = ["OrderID"]
        return this.pk.map((k) => row[k])
    }
    async load()
    {

    }
    async save()
    {

    }
    async createRow(row = {})
    {
        var i = 0;
        while (this.mods["new" + (++i)])
            ;
        const k = "new" + i
        row[""] = {k, op: "CREATE"}
        this.mods[k] = row;
        this.refresh();
    }
    async deleteRow()
    {
        const trc = this.getCurrentRow()
        if (!trc)
            return;
        const row = trc.props.row;
        row[""].op = "DELETE"
        this.mods[JSON.stringify(row[""].k)] = row;
        console.log(row);
        this.refresh();
    }
    async duplicateRow()
    {

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



