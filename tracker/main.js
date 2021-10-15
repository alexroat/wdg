/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


async function main()
{

    const IPFS = require('ipfs')
    const OrbitDB = require('orbit-db')

// optional settings for the ipfs instance
    const ipfsOptions = {
        EXPERIMENTAL: {
            pubsub: true
        }
    }

    // Create IPFS instance with optional config
    const ipfs = await IPFS.create(ipfsOptions)

    // Create OrbitDB instance
    const orbitDB = await OrbitDB.createInstance(ipfs)

//create KV database
    const db = await orbitDB.keyvalue('test-db')
    
    console.log(db.id)
    //await db.put("ciao",{a:1,b:2})
    var v=await db.get("ciao")
    console.log(v)

}



//entrypoint
main()