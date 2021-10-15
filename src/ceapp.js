/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


import {Html,Wdg, Box, App, Container, TabbedView, Splitter, ColoredBox, Menu, Tree, Dialog, Table, Grid, Carousel, SideBar, SingleContainer,  Icon, PageMock,randomText,Demo} from 'wdg';

import {DemoCarousel,DemoSplitter,DemoMenu,DemoModal,DemoTable,DemoGrid} from 'wdg'

import {getWeb3,getContract} from './utils';
import Ipfs from 'ipfs'

import {QuadMap} from './quadmap'


export class QuadInfo extends Box
{
    constructor(props)
    {
        super(props)
        const self=this;
        this.on("pickquad",(e)=> this.setQuad(e.detail),{global:1})
    }
    async setQuad(q)
    {
        
        const self=this;
        this.empty()
        Wdg.get("<p/>").text(`quad ${q}`).appendTo(this)
        const app=CEApp.get();
        const ismine=await app.isQuadMine(q)
        Wdg.get("<p/>").text(`is Quad mine? ${ismine}`).appendTo(this)
        if (!ismine)
            new Html.Button().text("BUY THIS QUAD").appendTo(this).on("click",async ()=> {await app.buyQuad(q);await self.setQuad(q);})

    }
    
    
}

export class CEApp extends App
{
    constructor(props)
    {
        super(props)
        const self = this;
        this.sidebar = new SideBar().appendTo(this);
        this.header = new Icon({icon: "bars"}).appendTo(this, {w: 30}).on("click", function () {
            self.sidebar.toggle();
        });
        this.main = new TabbedView().appendTo(this, {p: 1});
        this.footer = new TabbedView().appendTo(this, {nocurrent: true});
        new ColoredBox().appendTo(this.footer).text(randomText());
        new ColoredBox().appendTo(this.footer).text(randomText());
        new ColoredBox().appendTo(this.footer).text(randomText());
        new QuadInfo().appendTo(this.footer);

        this.addContentAction(ColoredBox)
        this.addContentAction(PageMock)
        this.addContentAction(DemoCarousel)
        this.addContentAction(DemoSplitter)
        this.addContentAction(DemoMenu)
        this.addContentAction(DemoModal)
        this.addContentAction(DemoTable)
        this.addContentAction(DemoGrid)
        
        
        this.main.setCurrent(new QuadMap())
        
    }
    addContentAction(klass)
    {
        const self = this;
        const l = new Wdg().text(klass.name).on("click", function () {
            self.main.setCurrent(new klass());
            self.sidebar.toggle();
        }).appendTo(this.sidebar, {p: 1});
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
        return this.contract.methods.buy(qc).send({from: this.accounts[0], gas: 400000, value: cost});
    }

    async getQuadInfo(qc) {
        return this.contract.methods.getQuad(qc).call();
    }

    async getQuadFee(quad)
    {
        return await this.contract.methods.getQuadFee().call();
    }

    async setQuad(qc, price, hash)
    {
        console.log(qc, hash, price)
        return this.contract.methods.setQuad(qc, price, hash).send({from: this.accounts[0], gas: 400000});
    }

    async setQuadPrice(qc, price)
    {
        return this.contract.methods.setPrice(qc, price).send({from: this.accounts[0], gas: 400000});
    }

    async setQuadContent(qc, hash)
    {
        console.log(qc, hash)
        return this.contract.methods.setContent(qc, hash).send({from: this.accounts[0], gas: 400000});
    }

    async getQuadCost(qc) {
        return this.contract.methods.getQuadCost(qc).call();
    }

    async getMyWallet() {
        return this.accounts[0];
    }

    async isQuadMine(qc) {
        return (await this.getQuadInfo(qc)).owner == (await this.getMyWallet());
    }
    

}


CEApp.create( function(app){this.w3init();window.app=this;})
