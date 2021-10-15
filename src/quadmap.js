import wdg, {Wdg, Box} from "wdg"

import {Map, TileLayer} from 'leaflet';

import "leaflet/dist/leaflet.css"


const mod=(n, m)=> {
    return ((n % m) + m) % m;
}

class LeafletMap extends Wdg
{
    constructor(props)
    {
        super(props);
        this.map = L.map(this.el).setView([51.505, -0.09], 13);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(this.map);
    }
}

export class QuadMap extends LeafletMap
{
    constructor(props)
    {
        super(props)

        this.container=new Wdg().appendTo(this).expand();

        this.map = new Map(this.container.el).setView([37.75, -122.23], 10);
        this.lg = L.layerGroup().addTo(this.map);
        this.map.zoomControl.setPosition('bottomright');
        
        var tiles = new TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        this.map.on('click touchdown', (e) => this.pickQuad(e.latlng));
    }
    
    doLayout()
    {
        this.map.invalidateSize();
        return super.doLayout();
    }
    latlon2qc(latlng, len)
    {
        var k = this.map.project(latlng, 0);
        k.x = mod(k.x / 64, 4)
        k.y = mod(k.y / 64, 4)
        var code = ""
        for (var i = 0; i < len; i++)
        {
            const qx = parseInt(k.x)
            const qy = parseInt(k.y)
            code += (qy * 4 + qx).toString(16);
            k.x = (k.x - qx) * 4;
            k.y = (k.y - qy) * 4;
        }
        return code;
    }

    pickQuad(latlng)
    {
        const qc = this.latlon2qc(latlng, 8);
        this.qc = qc;
        const k = {x: 0., y: 0., dx: 256., dy: 256.};
        for (var c of qc)
        {
            const h = parseInt(c, 16);
            const i = parseInt(h / 4);
            const j = parseInt(h % 4);
            k.dx /= 4;
            k.dy /= 4;
            k.x += j * k.dx;
            k.y += i * k.dy;
        }
        const nw = this.map.unproject([k.x, k.y], 0);
        const se = this.map.unproject([k.x + k.dx, k.y + k.dy], 0);
        this.lg.clearLayers();
        const quad = L.rectangle([nw, se], {color: "#ff7800", weight: 1}).addTo(this.lg);
        
        
        this.trigger("pickquad",qc,{global:1})
    }

    async updatePopup(qc) {
        const info = await getQuadInfo(qc);
        const popupContent = $("<div/>");
        $("<div/>").appendTo(popupContent).append("<span>QUAD :" + qc + "</span>");
        $("<div/>").appendTo(popupContent).append("<span>OWNER :" + info.owner + "</span>");
        $("<div/>").appendTo(popupContent).append("<span>PRICE :" + info.price + "</span>");
        $("<div/>").appendTo(popupContent).append($("<button/>").text("BUY").click(async (e) => {
            await buyQuad(qc);
            this.updatePopup(qc);
            return false;
        }));
        popup.setContent(popupContent[0]);
    }
}

