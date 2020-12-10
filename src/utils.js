
export const cssSize = /(left|right|top|bottom|width|height|margin|border|padding|size)/i;
export function mergeObjs() {
    var r = {};
    for (var o of arguments)
        for (var k in o)
            r[k] = o[k]; return r;
}
;

export function mapTouch(ev)
{
    return (ev.changedTouches || [ev])[0];
}


export function formEncode(value, separator = "&")
{
    var lo = [];
    function traverse(x, prefix = "")
    {
        if (typeof x == 'object')
            for (var i in x)
                traverse(x[i], prefix ? `${prefix}[${i}]` : i)
        else
            lo.push([x, prefix]);
    }
    traverse(value);
    return lo.map(([x, prefix]) => (encodeURIComponent(prefix) + "=" + encodeURIComponent(x))).join(separator);
}








export function randomColor() {
    var str = (parseInt(0xffffff * Math.random())).toString(16);
    str = "0".repeat(6 - str.length) + str;
    return "#" + str;
}









export function whichEdge(ev, el, extra = 0)
{
    var ev = mapTouch(ev);
    var el = el || ev.src;
    const bcr = el.getBoundingClientRect();
    const x = ev.clientX - bcr.x;
    const y = ev.clientY - bcr.y;
    const style = window.getComputedStyle(el);
    const bleft = parseFloat(style.borderLeftWidth) + extra
    const btop = parseFloat(style.borderTopWidth) + extra
    const bright = bcr.width - parseFloat(style.borderRightWidth) - extra
    const bbottom = bcr.height - parseFloat(style.borderBottomWidth) - extra

    const ht = el.offsetWidth - parseFloat(style.borderRightWidth) - parseFloat(style.borderLeftWidth);
    const vt = el.offsetHeight - parseFloat(style.borderBottomWidth) - parseFloat(style.borderTopWidth);
    switch (true)
    {
        case x <= bleft && y <= btop:
            return "NW";
        case x <= bleft && y > bbottom:
            return "SW";
        case x > bright && y > bbottom:
            return "SE";
        case x > bright && y <= btop:
            return "NE";
        case y <= btop:
            return "N";
        case x <= bleft:
            return "W";
        case y > bbottom:
            return "S";
        case x > bright:
            return "E";
        default:
            return undefined;
}
}


