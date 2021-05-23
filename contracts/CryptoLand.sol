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
        string name;
    }
    
    
    mapping(string=> Land) lands;
    
    constructor() {
        lands[""].owner=contractOwner;//payable(address(this));
        lands[""].price=1000000000000000000;
        lands[""].name="global";
    }
    
    
    //contract owner methods
    function setFee(uint64 fee1e32) public  {
        require(msg.sender==contractOwner,_error_invalid_permission);
        fee=fee1e32;
    }
    

    //public methods
    function buy(string memory quad) public payable {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(msg.value>getCost(quad),_error_insufficient_amount);
        lands[quad].owner.transfer(lands[quad].price);
        contractOwner.transfer(getFee(quad));
        payable(msg.sender).transfer(msg.value-getCost(quad));
        lands[quad].owner=payable(msg.sender);
    }
    
    
    function lookup(string memory quad) public returns (address, string memory,uint256,uint256) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        return (lands[quad].owner,lands[quad].name,lands[quad].price,getCost(quad));
    }
    
    function getFee(string memory quad) public returns (uint256)
    {
       return (lands[quad].price*fee)>>32;
    }
    
    
    function getCost(string memory quad) public returns (uint256)
    {
       return lands[quad].price+getFee(quad);
    }
    
    function getFee() public returns (uint256) {
        return fee;
    }

    function getFeeTest() external view returns (string memory) {
        return greeting;
    }
    
    //land owner methods
    function setName(string memory quad,string memory name) public returns (address, uint256, string memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        lands[quad].name=name;
        return (lands[quad].owner,lands[quad].price,lands[quad].name);
    }
    
    function setPrice(string memory quad,uint32 price) public returns (address, uint256, string memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        lands[quad].price=price;
        return (lands[quad].owner,lands[quad].price,lands[quad].name);
    }
    
    function split(string memory quad) public returns (address, uint256, string memory) {
        require(lands[quad].owner!=address(0),_error_invalid_quad);
        require(lands[quad].owner==msg.sender,_error_quad_not_your_property);
        Land memory l;
        l.owner=lands[quad].owner;
        l.price=lands[quad].price/4;
        l.name=lands[quad].name;
        lands[string(abi.encodePacked(quad,"00"))]=l;
        lands[string(abi.encodePacked(quad,"01"))]=l;
        lands[string(abi.encodePacked(quad,"10"))]=l;
        lands[string(abi.encodePacked(quad,"11"))]=l;
        delete lands[quad];
        return (lands[quad].owner,lands[quad].price,lands[quad].name);
    }

    
}