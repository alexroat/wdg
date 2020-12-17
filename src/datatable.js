import {Wdg, Html} from "./wdg"
import {Table} from "./table";
import {ToolBar} from "./toolbar";
import {ToolBarButton} from "./buttons";
import {Icon} from "./icons";
import {whichEdge} from "./utils";

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
        if (!arguments.length)
            return this.el.value + "Z";
        this.el.value = x ? x.slice(0, -1) : null;
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


class Cell extends Wdg
{
    constructor(props)
    {
        super(props, document.createElement(props.header || props.col.header ? "th" : "td"))
        this.refresh();
    }
    refresh()
    {
        const {row, col, edit, formatCell} = this.props;
        this.formatCell();
    }
    doLayout()
    {
        if (this.props.col.sticky)
            this.css({left: this.el.offsetLeft, position: "sticky", "z-index": 1})
        return super.doLayout()
    }
    getRow()
    {
        return this.parent(Row)
    }
    getTable()
    {
        return this.parent(Table)
    }
    getValue()
    {
        const {row, col} = this.props;
        return row[col.name];
    }
    setValue(x)
    {
        const {row, col} = this.props;
        row[col.name] = x;
        this.trigger("cellchange", {}, {bubbles: true});
    }
    formatCell()
    {
        const self = this;
        const {row, col} = this.props;
        if (col.formatCell)
            return col.formatCell.call(this);

        this.removeAll()
        if (this.props.edit)
        {
            const cl = ({
                "DECIMAL": NumericInput,
                "INTEGER": NumericInput,
                "NUMERIC": NumericInput,
                "DATE": DateInput,
                "DATETIME": DateTimeInput,
            })[col.type] || Html.Input;
            const i = new cl(this.props).appendTo(this);
            i.on("change", (e) => {
                e.stopPropagation()
                self.setValue(self.hasClass("nullvalue") ? null : i.val())
                return false;
            }).on("keydown", function (e) {
                if ((e.which == 8 || e.which == 46) && i.val() == "")
                {
                    self.setValue(null)
                    self.doLayout();
                }
            }).on("mousedown touchstart", () => {
                self.toggleClass("nullvalue", false)
            })
            i.doLayout = function () {
                const val = self.getValue();
                self.toggleClass("nullvalue", val == null)
                this.val(val)
            }

        } else
        {
            const d = new Html.Span().appendTo(this)
            d.doLayout = function () {
                const val = self.getValue();
                self.toggleClass("nullvalue", val == null)
                this.text(val)
            }
        }
    }
}



class Row extends Html.Tr
{
    constructor(props)
    {
        super({cellClass: Cell, ...props})
        const {row, cols, edit, mods, k} = this.props;

        const self = this;


        this.on("cellchange", function (ev) {
            self.update();
        });
        this.on("click", function () {
            self.getTable().setCurrentRow(self);
        })
        this.refresh();
    }
    mergeChanges()
    {
        this.props = {...this.props, ...this.props.mods[JSON.stringify(this.props.k)]}
        return this;
    }
    refresh()
    {
        this.mergeChanges();
        const {row, cols, edit, mods, k, op, i, cellClass} = this.props;
        this.removeAll()
        for (var col of cols)
            new (col.cellClass || cellClass)({row, col, edit, op, mods, i}).appendTo(this)
    }
    getTable()
    {
        return this.parent(Table)
    }
    isModified()
    {
        const ks = JSON.stringify(this.props.k)
        return !!this.props.mods[ks];
    }
    cancel()
    {
        const ks = JSON.stringify(this.props.k)
        delete this.props.mods[ks];
        this.trigger("rowchange", {}, {bubbles: true}).doLayout();
    }
    update()
    {
        if (this.props.op !== "INSERT")
            this.props.op = "UPDATE"
        const ks = JSON.stringify(this.props.k)
        this.props.mods[ks] = {op: this.props.op, row: this.props.row, k: this.props.k};
        this.trigger("rowchange", {}, {bubbles: true}).doLayout();
    }
    delete()
    {
        this.props.op = "DELETE"
        const ks = JSON.stringify(this.props.k)
        this.props.mods[ks] = {op: this.props.op, row: this.props.row, k: this.props.k};
        this.trigger("rowchange", {}, {bubbles: true}).doLayout();
    }
    insert()
    {
        this.props.op = "INSERT"
        var i = 0;
        while (JSON.stringify(this.props.k = ["new", i]) in this.props.mods)
            i++;
        const ks = JSON.stringify(this.props.k)
        this.props.mods[ks] = {op: this.props.op, row: this.props.row, k: this.props.k};
        this.trigger("rowchange", {}, {bubbles: true}).doLayout();
    }
}

class HeaderCell extends Cell
{
    constructor(props)
    {
        super(props)
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
    formatCell()
    {
        const {col} = this.props;
        this.removeAll()
        this.text(col.name)
        new Sorter({col}).appendTo(this);
    }
    getValue()
    {
        return this.props.col.name
    }
    setValue()
    {

    }
}


class RowHeaderCell extends Cell
{
    constructor(props)
    {
        super({header: true, ...props})
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
    formatCell()
    {

    }
    getValue()
    {
        return this.props.i
    }
    setValue()
    {

    }
    doLayout()
    {
        this.removeAll()
        this.text(this.props.i)
        new Icon({UPDATE: "asterisk", INSERT: "plus", DELETE: "times"}[this.getRow().props.op] || "data").appendTo(this)
        return super.doLayout();
    }
}

export class DataTable extends Table
{
    constructor(props)
    {
        super({rows: [], cols: [], mods: {}, pk: [], count: 0, page: 0, pageSize: 10, ...props, })
        const self = this;
        this.toolbar = new ToolBar().prependTo(this, {w: "auto"});
        this.pager = new Pager().appendTo(this.toolbar);
        this.btnLoad = new LockButton().appendTo(this.toolbar);
        this.btnLoad = new ToolBarButton({icon: "sync", action: () => {
                self.props.mods = {};
                self.load();
            }}).appendTo(this.toolbar)
        this.btnSave = new ToolBarButton({icon: "save", action: () => self.save()}).appendTo(this.toolbar)
        this.btnAddRow = new ToolBarButton({icon: "file", action: () => self.insertRow()}).appendTo(this.toolbar)
        this.btnDeleteRow = new ToolBarButton({icon: "trash", action: () => self.deleteRow()}).appendTo(this.toolbar)
        this.btnDuplicateRow = new ToolBarButton({icon: "copy", action: () => self.copyRow()}).appendTo(this.toolbar)
        this.modsresume = new Html.Div().appendTo(this, {w: 100}).css({overflow: "auto"})
        this.modsresume.doLayout = function () {
            this.text(JSON.stringify(self.props.mods));
            return this;
        }

        this.on("rowchange", function (e) {
            self.modsresume.doLayout();
        })
    }
    refresh()
    {
        const {rows, mods, pk, page, pageSize, edit} = this.props;
        const cols = this.getCols()
        const self = this;
        this.clear()
        new Row({cols, edit, mods, cellClass: HeaderCell}).appendTo(this.head);
        var i = page * pageSize;
        for (var row of rows)
            new Row({row, cols, k: this.getKey(row), edit, i: i++, mods}).appendTo(this.body);
        for (var {k, row, op} of Object.values(mods))
            if (op == "INSERT")
                new Row({row, cols, k, edit, i: i++, mods}).appendTo(this.body);
        this.setCurrentRow();
        return super.doLayout();
    }
    async load()
    {
        this.setCols([{name: "id", pk: 1}, {name: "miao"}, {name: "bau"}, {name: "test", formatCell: function () {
                    this.text(JSON.stringify(this.props.row));
                }}]);
        this.setRows([{ciao: 1, miao: 2, bau: 3}, {ciao: 2, miao: 2, bau: 3}, {ciao: 3, miao: 2, bau: 3}]);
        this.props.pk = this.getPKCols();
        this.doLayout();
    }
    async save()
    {
        this.props.mods = {};
        this.doLayout();
    }
    getFormatCol()
    {
        return {header: true, formatCell: function () {
                this.text(this.props.row.i);
            }};
    }
    getPKCols()
    {
        return this.props.cols.filter((c) => c.pk).map((c) => c.name)
    }
    getKey(row)
    {

        const k = Object.fromEntries(this.props.pk.map((c) => [c, row[c]]))
        return k;
    }
    clear()
    {
        this.body.removeAll();
        this.head.removeAll();
    }
    setCols(cols)
    {
        this.props.cols = cols;
    }
    getCols()
    {
        return [{cellClass: RowHeaderCell, virtual: true, name: "", sticky: 1}, ...this.props.cols];
    }
    setRows(rows)
    {
        this.props.rows = rows;
    }
    setData(data)
    {
        this.setCols(data.cols);
        this.setRows(data.rows);
        this.doLayout();
    }
    pageCount()
    {
        return Math.ceil(this.props.count / this.props.pageSize);
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
    async copyRow()
    {
        const trc = this.getCurrentRow()
        if (trc)
            this.insertRow({...trc.props.row});
    }
    async insertRow(row = {})
    {
        const {rows, cols, mods, pk, page, pageSize, edit} = this.props;
        new Row({row, cols, edit, mods}).appendTo(this.body).insert();
        this.refresh()
    }
    async deleteRow()
    {
        const trc = this.getCurrentRow();
        if (trc.isModified())
            trc.cancel(), this.refresh();
        else
            trc.delete();
    }
    setCurrentRow(trc)
    {
        if (!trc)
            trc = this.body.children()[0]
        this.body.find("tr").forEach((w) => w.toggleClass("current", w === trc))
        return this.getCurrentRow();
    }
    getCurrentRow()
    {
        return this.body.find("tr.current")[0];
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
        const {col} = this.props;
        this.removeAll();
        var icon;
        switch (true)
        {
            case col.sort < 0:
                icon = "sort-down"
                break;
            case col.sort > 0:
                icon = "sort-up"
                break;
            default:
                icon = "sort"
        }
        this.icon = new Icon({icon}).appendTo(this);
    }
    toggleSort()
    {
        const {col} = this.props;
        const table = this.parent(DataTable)
        switch (true)
        {
            case col.sort < 0:
                col.sort = 0
                break;
            case col.sort > 0:
                col.sort = -1
                break;
            default:
                col.sort = 1
        }
        table.load();
    }
}