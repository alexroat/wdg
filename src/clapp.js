import $ from 'jquery';
import jQuery from 'jquery';
window.$ = jQuery;
import L from "leaflet";
import {getWeb3,getContract} from './utils';
import Ipfs from 'ipfs'
import 'w3-css/w3.css';
import 'leaflet/dist/leaflet.css';

const mod=(n, m)=> {
    return ((n % m) + m) % m;
}






class Wdg
{
    constructor(sel)
    {
        this.el = $(sel);
    }

    doLayout()
    {

    }
}

class Modal extends Wdg
{
    constructor()
    {
        super('<div id="myModal" class="modal"/>')
        const mcontent = $('<div class="modal-content"/>').appendTo(this.el);
        const btnClose = $('<span class="close"/>').html("&times").appendTo(mcontent).click(() => this.close("CANCEL"));
        this.content = $('<div class="w3-container"/>').appendTo(mcontent);
        this.btnSpace = $('<div class="clearfix">').appendTo(mcontent);
    }

    async showModal()
    {
        var self = this;
        new Promise(function (resolve, reject) {
            self.__resolve = resolve;
        }).finally(() => this.el.remove());
        $("body").append(this.el);
    }

    addButton(text, fn)
    {
        const btnOK = $('<button type="button" class="w3-btn w3-black"/>').text(text).appendTo(this.btnSpace).click(fn);
    }

    close(data)
    {
        this.__resolve(data);
    }
}


class App extends Wdg
{
    constructor()
    {
        super("body");
    }
}



class CLApp extends App
{
    constructor()
    {
        super()
        this.map = new CLMap("#mapid");
        this.info=new QuadInfo();
        this.info.el.appendTo(this.el);
    }


    async w3init()
    {

        this.web3 = await getWeb3();
        this.accounts = await this.web3.eth.getAccounts();
        this.contract = await getContract(this.web3);
        this.contract.events.BuyEvent({})
                .on('data', async function (event) {
                    console.log(event.returnValues);
                })
                .on('error', console.error);

        this.ipfs = await Ipfs.create();


    }

    async buyQuad(qc) {
        const cost = await this.getQuadCost(qc);
        return window.app.contract.methods.buy(qc).send({from: window.app.accounts[0], gas: 400000, value: cost});
    }

    async getQuadInfo(qc) {
        return window.app.contract.methods.getQuad(qc).call();
    }

    async getQuadFee(quad)
    {
        return await this.contract.methods.getQuadFee().call();
    }

    async setQuad(qc, price, hash)
    {
        console.log(qc, hash, price)
        return window.app.contract.methods.setQuad(qc, price, hash).send({from: window.app.accounts[0], gas: 400000});
    }

    async setQuadPrice(qc, price)
    {
        return window.app.contract.methods.setPrice(qc, price).send({from: window.app.accounts[0], gas: 400000});
    }

    async setQuadContent(qc, hash)
    {
        console.log(qc, hash)
        return window.app.contract.methods.setContent(qc, hash).send({from: window.app.accounts[0], gas: 400000});
    }

    async getQuadCost(qc) {
        return window.app.contract.methods.getQuadCost(qc).call();
    }

    async getMyWallet() {
        return window.app.accounts[0];
    }

    async isQuadMine(qc) {
        return (await this.getQuadInfo(qc)).owner == (await this.getMyWallet());
    }

    static getInstance()
    {
        if (!CLApp.instance)
            CLApp.instance = new CLApp();
        return CLApp.instance;
    }
    static instance;

    async geonames(word)
    {
        $.ajax({
            url: "http://api.geonames.org/wikipediaSearchJSON",
            dataType: "json",
            data: {
                featureClass: "P",
                style: "full",
                username: "demo",
                maxRows: 12,
                q: word
            },
            success: function (data) {}})
    }

    async geonames3(word)
    {


        $.ajax({
            url: "https://api.github.com/users/jeresig",
            dataType: "jsonp",
            //jsonpCallback: "logResults"
            success: (data) => console.log(data)
        });
    }

    async geonames2(word)
    {


        $.ajax({
            url: "http://api.geonames.org/wikipediaSearchJSON",
            dataType: "jsonp",
            //jsonpCallback: "logResults"
            success: (data) => console.log(data)
        });
    }

    async uploadFile2Ipfs(file)
    {
        const qm = await this.ipfs.add(file);
        return qm.path;
    }


    static hashLogo="QmYWfLDunX369iAF24MwQ4LsNLj6L75sUayjY3vCEzdZCJ";
}



class LeafletMap extends Wdg
{
    constructor(sel)
    {
        super(sel);
        this.map = L.map(this.el[0]).setView([51.505, -0.09], 13);
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


class CLMap extends LeafletMap
{
    constructor(sel)
    {
        super(sel);
        this.map.on('click touchdown', (e) => this.pickQuad(e.latlng));
        this.lg = L.layerGroup().addTo(this.map);
        this.map.zoomControl.setPosition('bottomright');
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

        new QuadModal(qc).showModal();
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

class Uploader extends Wdg
{
    constructor(hash)
    {
        super("<div class='w3-card'/>");
        this.el.append("DROP FILE HERE");
        this.ifile = $("<input type='file'/>").appendTo(this.el);
        this.ifile.on('change', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onFileDrop(e.currentTarget.files[0]);
        });
        this.img = $(`<img style='max-width:200px;max-height:200px;'/>`).appendTo(this.el);
        this.hash = hash;
    }
    async onFileDrop(file)
    {
        const hash = await CLApp.getInstance().uploadFile2Ipfs(file);
        this.hash = hash;
    }

    set hash(hash)
    {
        this._hash = hash;
        this.img[0].src = `https://ipfs.io/ipfs/${hash}`;
    }

    get hash()
    {
        return this._hash||CLApp.hashLogo;
    }

}



class QuadInfo extends Wdg
{
    constructor(info)
    {
        super('<div class="w3-panel w3-bottom w3-red" style="height:40%"/>');
        this.info=info;
        this.refresh()
    }

    refresh()
    {
        this.el.empty()
        $("<div/>").text(this.info).appendTo(this.el);
    }

}

class QuadModal extends Modal
{
    constructor(qc)
    {
        super();
        this.qc = qc;
        this.loadQuadInfo();
    }
    async loadQuadInfo()
    {
        this.content.empty();
        this.btnSpace.empty();
        $("<div/>").text("QUAD: " + this.qc).appendTo(this.content);
        const info = await CLApp.getInstance().getQuadInfo(this.qc);
        const cost = await CLApp.getInstance().getQuadCost(this.qc);
        if (await CLApp.getInstance().isQuadMine(this.qc))
        {
            $('<label><b>Price</b></label>').appendTo(this.content);
            const inpPrice = $('<input class="w3-input w3-border" type="number" placeholder="Enter Password" name="psw" required/>').val(info.price).appendTo(this.content);

            const uploader = new Uploader(info.content);
            uploader.el.appendTo(this.content);
            this.addButton("Update", () => this.updateQuad(inpPrice.val(), uploader.hash));
        } else
        {
            $("<div/>").text("info: " + info).appendTo(this.content);
            $("<div/>").text("cost: " + cost).appendTo(this.content);
            this.addButton("Buy", () => this.buyQuad())
        }
        this.addButton("Close", () => this.close())
    }

    async buyQuad()
    {
        await CLApp.getInstance().buyQuad(this.qc);
        await this.loadQuadInfo();
    }
    async updateQuad(price, content)
    {
        await CLApp.getInstance().setQuad(this.qc, price || 0, content || "");
        await this.loadQuadInfo();
    }
}



//main function
document.addEventListener("DOMContentLoaded", async () => {
    const app = CLApp.getInstance();
    window.app = app;
    await app.w3init();
})



function getTileURL(lat, lon, zoom) {
    var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
    var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << zoom)));
    return "" + zoom + "/" + xtile + "/" + ytile;
}


