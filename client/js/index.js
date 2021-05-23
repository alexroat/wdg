class CLApp
{
    constructor()
    {

    }

    async init()
    {
        this.web3 = await getWeb3();
        this.accounts = await this.web3.eth.getAccounts();
        this.contract = await getContract(this.web3);
        console.log("ready")

        $("#form").on("submit", async (e) => {
            e.preventDefault();
            this.updateGreeting($("#input").val());
        });
    }

    async displayGreeting()
    {
        var greeting = await this.contract.methods.sayHello().call();
        $("h2").html(greeting);
    }

    async updateGreeting(text)
    {
        await this.contract.methods.updateGreeting(text).send({from: this.accounts[0], gas: 400000});
        await this.displayGreeting();
    }

    async getFee(quad)
    {
        return await this.contract.methods.getFee().call();
    }
    
    async lookup(quad)
    {
        return await this.contract.methods.lookup(quad).call();
    }

    static async getInstance()
    {
        if (!CLApp.instance)
        {
            CLApp.instance = new CLApp();
            await CLApp.instance.init();
        }
        return CLApp.instance;
    }
    static instance;

}


//main function
$(async () => {
    const app = await CLApp.getInstance();
    app.displayGreeting();
    window.app = app;
})