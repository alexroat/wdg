// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title CryptoLand
 * @dev alex
 */
contract CryptoLand {

    address payable private contractOwner=payable(address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4));
    string constant _error_invalid_permission = "invalid permission!";
    string constant _error_invalid_quad = "invalid quad!";
    string constant _error_quad_not_your_property = "quad is not of your property!";
    string constant _error_insufficient_amount="insufficient amount!";
    uint256 public fee=4294967;//0.1% expressed as range in 2^32 -> 0.001*(1<<32)
    string constant hashLogo = "QmYWfLDunX369iAF24MwQ4LsNLj6L75sUayjY3vCEzdZCJ";
    
    string public greeting = "hello";
    function sayHello() external view returns (string memory) {
        return greeting;
    }

    function updateGreeting(string calldata _greeting) external {
        greeting = _greeting;
    }

    
    struct Land {
        address payable owner;
        uint256 price;
        string content;
    }

    Land landDefault;
    
    
    
    mapping(string=> Land) lands;
    mapping(address=> string[]) properties;
    
    constructor() {
        /*
        lands[""].owner=contractOwner;//payable(address(this));
        lands[""].price=1000000000000000000;
        lands[""].content="";
        properties[contractOwner].push("");
        */

        landDefault.owner=contractOwner;
        landDefault.price=0;
        landDefault.content=hashLogo;
    }
    
    
    //contract owner methods
    function setFee(uint64 fee1e32) public  {
        require(msg.sender==contractOwner,_error_invalid_permission);
        fee=fee1e32;
    }
    
    event BuyEvent(string quad);

    //public methods
    function buy(string memory quad) public payable  {
        //require(lands[quad].owner!=address(0),_error_invalid_quad);
        uint256 cost=getQuadCost(quad);
        require(msg.value==cost,_error_insufficient_amount);
        lands[quad].owner.transfer(lands[quad].price);
        contractOwner.transfer(cost-lands[quad].price);
        lands[quad].owner=payable(msg.sender);
        if (bytes(lands[quad].content).length == 0)
            lands[quad].content=hashLogo;
        updatePrice(quad,0);
        emit BuyEvent(quad);
    }

    function getParent(string memory quad) public returns (string memory)
    {
        bytes memory bq= bytes(quad);
        uint l=bq.length-1;
        bytes memory result = new bytes(l);
        for(uint i = 0; i < l; i++) {
            result[i] = bq[i];
        }
        return string(result);
    }
    
    function updatePrice(string memory quad,int256 delta) private{
        lands[quad].price=uint256(int256(lands[quad].price)+delta);
        if (bytes(quad).length>0)
            updatePrice(getParent(quad),delta);
    }

    
    
    function getQuad(string memory quad) public returns (Land memory) {
        //require(lands[quad].owner!=address(0),_error_invalid_quad);
        Land memory l=lands[quad];
        return l.owner!=address(0)?l:landDefault;
    }

    function hello(string memory quad) public returns (string memory) {
        return ("hello");
    }

    function getQuadFee(string memory quad) public returns (uint256)
    {
       return (lands[quad].price*fee)>>32;
    }
    
    
    function getQuadCost(string memory quad) public returns (uint256)
    {
       return lands[quad].price+getQuadFee(quad);
    }
    
    function getFee() public returns (uint256) {
        return fee;
    }

    function setQuad(string memory quad,int256 price,string memory content) public returns  (Land memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        int256 delta=int256(price)-int256(lands[quad].price);
        updatePrice(quad,delta);
        lands[quad].content=content;
        return (lands[quad]);
    }
    
    //land owner methods
    function setContent(string memory quad,string memory content) public returns  (Land memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        lands[quad].content=content;
        return (lands[quad]);
    }
    
    function setPrice(string memory quad,int256 price) public returns  (Land memory) {
        //require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        int256 delta=int256(price)-int256(lands[quad].price);
        updatePrice(quad,delta);
        return (lands[quad]);
    }
    
    function split(string memory quad) public returns (Land memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        Land memory l;
        l.owner=lands[quad].owner;
        l.price=lands[quad].price/4;
        l.content=lands[quad].content;
        lands[string(abi.encodePacked(quad,"00"))]=l;
        lands[string(abi.encodePacked(quad,"01"))]=l;
        lands[string(abi.encodePacked(quad,"10"))]=l;
        lands[string(abi.encodePacked(quad,"11"))]=l;
        delete lands[quad];
        return (lands[quad]);
    }
    
    function split2(string memory quad) public  returns (Land memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory s="0";

        Land memory lp=lands[quad];
        uint price=lands[quad].price/4;
        for (uint i=0; i<16; i++) {
            Land memory l;
            l.owner=lp.owner;
            l.price=price;
            l.content=lp.content;
            s[0]=alphabet[i];
            lands[string(abi.encodePacked(quad,string(s)))]=l;
        }
        return (lands[quad]);
    }
    
    
    function appendS(string memory quad,uint i) public returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory s="0";
        s[0]=alphabet[i];
       return string(abi.encodePacked(quad,string(s)));
    }
    
    function getProperties(address o) public returns (string[] memory) {
       return properties[o];
    }

   function getLand(string memory quad) public returns (Land memory) {
       return lands[quad];
    }
}